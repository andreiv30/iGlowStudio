// @ts-check
import { defineConfig } from 'astro/config';

// Site complet static: `npm run build` generează în dist/ fișierele care se urcă în public_html.
export default defineConfig({
  site: process.env.SITE_URL || 'https://iglowstudio.ro',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
