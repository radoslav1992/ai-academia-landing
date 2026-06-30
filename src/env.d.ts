/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type Fetcher = import('@cloudflare/workers-types').Fetcher;

interface Env {
  /** D1 database holding course subscribers. */
  DB: D1Database;
  /** Static assets binding (set in wrangler.jsonc). */
  ASSETS: Fetcher;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
