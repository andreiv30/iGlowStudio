// sitemap.xml: toate paginile publice, generate la fiecare build.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const servicii = (await getCollection('servicii')).sort((a, b) => a.data.ordine - b.data.ordine);
  const pagini = await getCollection('pagini');

  const urls: { path: string; priority: string; changefreq: string }[] = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/servicii/', priority: '0.9', changefreq: 'monthly' },
    ...servicii.map((s) => ({ path: `/servicii/${s.id}/`, priority: '0.8', changefreq: 'monthly' })),
    { path: '/oferte/', priority: '0.8', changefreq: 'weekly' },
    { path: '/galerie/', priority: '0.6', changefreq: 'weekly' },
    { path: '/echipa/', priority: '0.6', changefreq: 'monthly' },
    { path: '/despre-noi/', priority: '0.6', changefreq: 'monthly' },
    { path: '/date-identificare/', priority: '0.2', changefreq: 'yearly' },
    ...pagini.map((p) => ({ path: `/${p.id}/`, priority: '0.2', changefreq: 'yearly' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${new URL(u.path, site).toString()}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
