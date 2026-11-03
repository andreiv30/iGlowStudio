// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Paginile sunt generate static la build (rapide, fără server pentru fiecare vizită).
// Adapterul Node rulează doar rutele marcate cu `prerender = false`
// (autentificarea GitHub pentru panoul /admin) și servește fișierele statice.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.iglowstudio.ro',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
