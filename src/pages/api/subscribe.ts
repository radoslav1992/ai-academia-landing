import type { APIRoute } from 'astro';
import { COURSES } from '../../data/content';

// Runs on the Cloudflare Worker (writes to D1) — never prerendered.
export const prerender = false;

const VALID_COURSE_IDS = new Set(COURSES.map((c) => c.id));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribePayload = {
  name?: unknown;
  email?: unknown;
  courses?: unknown;
  consent?: unknown;
  source?: unknown;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) {
    return json(
      { ok: false, error: 'Базата данни не е налична. Опитай по-късно.' },
      503,
    );
  }

  // --- parse ---
  let body: SubscribePayload;
  try {
    body = (await request.json()) as SubscribePayload;
  } catch {
    return json({ ok: false, error: 'Невалидна заявка.' }, 400);
  }

  // --- validate ---
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const consent = body.consent === true;
  const rawCourses = Array.isArray(body.courses) ? body.courses : [];
  const courses = [...new Set(rawCourses)].filter(
    (c): c is string => typeof c === 'string' && VALID_COURSE_IDS.has(c as never),
  );

  const errors: string[] = [];
  if (name.length < 2 || name.length > 120) errors.push('Моля, въведи валидно име.');
  if (!EMAIL_RE.test(email) || email.length > 254)
    errors.push('Моля, въведи валиден имейл адрес.');
  if (courses.length === 0) errors.push('Избери поне един курс.');
  if (!consent) errors.push('Необходимо е съгласие за обработка на данните.');

  if (errors.length > 0) {
    return json({ ok: false, error: errors.join(' ') }, 400);
  }

  // --- persist (idempotent on email; merges course selections) ---
  const coursesJson = JSON.stringify(courses);
  const ip = clientAddress ?? request.headers.get('cf-connecting-ip') ?? null;
  const ua = request.headers.get('user-agent')?.slice(0, 400) ?? null;

  try {
    // Merge with any previous selection for this e-mail.
    const existing = await db
      .prepare('SELECT courses FROM subscribers WHERE email = ?1')
      .bind(email)
      .first<{ courses: string }>();

    let merged = courses;
    if (existing?.courses) {
      try {
        const prev = JSON.parse(existing.courses) as string[];
        merged = [...new Set([...prev, ...courses])];
      } catch {
        /* keep new selection if stored value is malformed */
      }
    }
    const mergedJson = JSON.stringify(merged);

    await db
      .prepare(
        `INSERT INTO subscribers (name, email, courses, consent, source, ip, user_agent)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(email) DO UPDATE SET
           name = excluded.name,
           courses = ?3,
           consent = excluded.consent,
           source = excluded.source,
           ip = excluded.ip,
           user_agent = excluded.user_agent,
           updated_at = datetime('now')`,
      )
      .bind(
        name,
        email,
        existing ? mergedJson : coursesJson,
        consent ? 1 : 0,
        typeof body.source === 'string' ? body.source.slice(0, 60) : 'web',
        ip,
        ua,
      )
      .run();

    return json({ ok: true });
  } catch (err) {
    console.error('subscribe insert failed', err);
    return json(
      { ok: false, error: 'Записването не бе успешно. Опитай отново.' },
      500,
    );
  }
};

// Reject anything that isn't a POST with a small, clear message.
export const ALL: APIRoute = () =>
  json({ ok: false, error: 'Методът не е разрешен.' }, 405);
