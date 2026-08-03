// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// Local dev/build only: load .env into process.env so request-time code that
// reads process.env (admin auth in src/lib/auth.ts) works with `astro dev`.
// Vite otherwise exposes .env only via import.meta.env. In production the app
// runs `dist/server/entry.mjs` (this config is not executed) and gets its
// variables from the container/host environment instead.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// https://astro.build/config
export default defineConfig({
  // Production domain — used for canonical URLs, Open Graph and the sitemap.
  // Update this if the site is deployed under a different domain.
  site: 'https://fairscompany.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});