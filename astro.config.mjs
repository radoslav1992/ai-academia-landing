// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/data/site.ts';

// https://astro.build/config
export default defineConfig({
  // Canonical production URL — used for sitemap, canonical tags and JSON-LD.
  // Override by editing src/data/site.ts (or the SITE_URL env at build time).
  site: SITE_URL,

  // Bulgarian-first single-locale site.
  trailingSlash: 'never',

  // Mostly static (great for SEO + edge caching). Only /api/* runs on the
  // Worker on-demand to write subscribers to D1.
  output: 'static',

  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),

  integrations: [
    sitemap({
      i18n: undefined,
      filter: (page) => !page.includes('/api/'),
    }),
  ],

  build: {
    inlineStylesheets: 'auto',
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  compressHTML: true,
});
