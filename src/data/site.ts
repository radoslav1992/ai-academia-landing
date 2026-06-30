/**
 * Global site configuration.
 *
 * IMPORTANT: change SITE_URL to your real production domain before deploying —
 * it drives canonical tags, Open Graph URLs, the sitemap and JSON-LD.
 */

export const SITE_URL =
  (typeof process !== 'undefined' && process.env && process.env.SITE_URL) ||
  'https://ai-akademia.bg';

export const SITE = {
  /** Brand name, in Bulgarian. */
  name: 'AI Академия',
  /** Legal owner / lecturer. */
  owner: 'Радослав Додников',
  /** Default <title> for the home page. */
  title: 'AI Академия — безплатни AI курсове на живо в София',
  /** Meta description (≤ ~160 chars), Bulgarian. */
  description:
    'Три безплатни курса по изкуствен интелект на живо в София: създаване на сайтове и софтуер, генериране на медия и съдържание за социалните мрежи. Без такси, без условия — записваш се и получаваш датата, часа и мястото на имейла си.',
  /** Short tagline used in Open Graph / structured data. */
  tagline: 'Безплатни AI курсове на живо в София',
  /** Primary contact e-mail. */
  email: 'radoslav.dodnikov@gmail.com',
  /** Locale tags. */
  locale: 'bg_BG',
  lang: 'bg',
  /** City where the courses are held. */
  city: 'София',
  country: 'BG',
  /** Social share image (lives in /public). */
  ogImage: '/og-image.png',
  /** Theme color used by the browser chrome. */
  themeColor: '#FAF6EF',
} as const;

/** Clean, SEO-friendly Bulgarian URL slugs for the legal pages. */
export const ROUTES = {
  home: '/',
  terms: '/obshti-usloviya',
  privacy: '/politika-za-poveritelnost',
  cookies: '/politika-za-biskvitki',
} as const;
