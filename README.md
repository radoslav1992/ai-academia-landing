# AI Академия — лендинг страница

Безплатни AI курсове на живо в София. Едностранична (landing) кампанийна
страница на български език с форма за записване, чиито абонати се пазят в
**Cloudflare D1**. Сайтът е изграден с **Astro** и се хоства като **Cloudflare
Worker** (статични страници на edge + един API маршрут).

Построен по дизайн хендоф от Claude Design (`Landing.dc.html` + правните
страници).

---

## Технологии

| Слой            | Избор                                                            |
| --------------- | ---------------------------------------------------------------- |
| Framework       | [Astro 5](https://astro.build) (статичен изход + on-demand API)  |
| Хостинг         | Cloudflare Workers (`@astrojs/cloudflare`, Workers Assets)       |
| База данни      | Cloudflare D1 (SQLite) — таблица `subscribers`                   |
| Шрифтове        | Self-hosted Lora + Manrope (Fontsource) — с пълна кирилица       |
| SEO             | JSON-LD, Open Graph, Twitter cards, sitemap, canonical, robots   |
| GEO             | `llms.txt`, FAQ schema, отворени за AI crawlers (robots.txt)     |

### Защо не Newsreader / Plus Jakarta Sans?

Дизайнът задаваше тези два шрифта, но **нито един от тях не съдържа основните
кирилски глифи**, нужни за български (Newsreader няма кирилица изобщо; Plus
Jakarta Sans има само `cyrillic-ext`, без базовия диапазон). За да изглежда
сайтът както е замислен, те са заменени с най-близките по характер шрифтове с
пълна кирилица: **Lora** (заглавия, serif) и **Manrope** (текст, sans). Виж
`src/styles/global.css`.

---

## Локална разработка

```bash
npm install          # инсталира зависимостите
npm run dev          # Astro dev сървър на http://localhost:4321
```

`npm run dev` стартира Astro с включен Cloudflare platform proxy, така че
формата работи срещу **локална** D1 база.

### Стартиране срещу пълния Worker (както в продукция)

```bash
npm run build        # компилира в dist/ (вкл. dist/_worker.js)
npm run db:init      # създава таблицата в ЛОКАЛНАТА D1
npm run preview      # wrangler dev — Worker + статични файлове + D1
# → http://localhost:8787
```

---

## Настройка на Cloudflare D1 (еднократно)

1. **Създай базата:**

   ```bash
   npx wrangler d1 create ai-akademia-subscribers
   ```

2. **Постави върнатото `database_id`** в `wrangler.jsonc` (полето
   `REPLACE_WITH_YOUR_D1_DATABASE_ID`).

3. **Приложи схемата към продукционната база:**

   ```bash
   npm run db:init:remote
   # или чрез миграции:
   npx wrangler d1 migrations apply ai-akademia-subscribers --remote
   ```

### Схема `subscribers`

| колона       | тип     | бележка                                          |
| ------------ | ------- | ------------------------------------------------ |
| `id`         | INTEGER | първичен ключ                                    |
| `name`       | TEXT    | име от формата                                    |
| `email`      | TEXT    | уникален — повторно записване обновява реда       |
| `courses`    | TEXT    | JSON масив, напр. `["webdev","media"]`            |
| `consent`    | INTEGER | 1 = дадено GDPR съгласие                          |
| `source`     | TEXT    | от кой бутон е отворена формата                   |
| `ip`         | TEXT    | груба мрежова информация (анти-спам)             |
| `user_agent` | TEXT    | браузър                                           |
| `created_at` | TEXT    | първо записване                                  |
| `updated_at` | TEXT    | последна промяна                                 |

Едно лице = един ред (по имейл). Повторно записване **слива** избраните курсове.

### Преглед на записаните

```bash
# продукция
npx wrangler d1 execute ai-akademia-subscribers --remote \
  --command "SELECT created_at, name, email, courses FROM subscribers ORDER BY id DESC LIMIT 50"
```

---

## Деплой

```bash
npm run deploy       # astro build && wrangler deploy
```

Първият деплой иска `npx wrangler login`. След това Worker-ът се качва заедно
със статичните файлове (Workers Assets) и D1 binding-а.

### Преди публикуване (важно)

- [ ] `src/data/site.ts` → смени `SITE_URL` на реалния домейн (управлява
      canonical, Open Graph, sitemap, JSON-LD).
- [ ] Обнови `Sitemap:` реда в `public/robots.txt` и абсолютните URL-и в
      `public/llms.txt` със същия домейн.
- [ ] Попълни данните в квадратни скоби `[ ]` в правните страници (юридическо
      лице, ЕИК, адрес) — `src/pages/obshti-usloviya.astro` и
      `politika-za-poveritelnost.astro`.
- [ ] Свържи изпращане на потвърдителен имейл (виж по-долу).
- [ ] Закачи домейна към Worker-а в Cloudflare (Workers → Custom Domains).

### Изпращане на имейл (по желание, следваща стъпка)

Формата записва в D1, но все още не праща имейл. За да активираш
потвържденията, добави интеграция (напр. [Resend](https://resend.com) или
MailChannels) в `src/pages/api/subscribe.ts` след успешния `INSERT`. Текстът на
успеха вече обещава имейл с дата/час/място.

---

## Структура

```
src/
├── data/
│   ├── site.ts          # домейн, мета, маршрути (SITE_URL тук!)
│   └── content.ts       # цялото българско съдържание (курсове, ЧЗВ, лектор)
├── lib/
│   └── structured-data.ts  # JSON-LD builders (SEO + GEO)
├── layouts/
│   ├── BaseLayout.astro    # <head>, мета, шрифтове, JSON-LD
│   └── LegalLayout.astro   # обвивка за правните страници
├── components/          # Header, Hero, Courses, Lecturer, Faq, SubscribeModal …
├── pages/
│   ├── index.astro      # началната страница
│   ├── obshti-usloviya.astro            # Общи условия
│   ├── politika-za-poveritelnost.astro  # Поверителност
│   ├── politika-za-biskvitki.astro      # Бисквитки
│   └── api/subscribe.ts # POST endpoint → D1 (Worker)
public/                  # robots.txt, llms.txt, og-image, икони, manifest
db/                      # schema.sql + migrations/
```

---

## SEO и GEO

- **SEO:** уникални `<title>`/description на всяка страница, canonical, Open
  Graph + Twitter, `sitemap-index.xml`, `lang="bg"`, семантичен HTML,
  оптимизирани (WebP) изображения, богат **JSON-LD** граф
  (`EducationalOrganization`, `Person`, 3×`Course` с безплатна оферта,
  `FAQPage`, `WebSite`).
- **GEO (Generative Engine Optimization):** `public/llms.txt` с фактологично
  резюме за LLM търсачки; FAQ структурирани данни (директни въпрос→отговор
  двойки за цитиране); `robots.txt` изрично пуска GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended и др.
```
