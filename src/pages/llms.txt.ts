// llms.txt (https://llmstxt.org): un rezumat în Markdown al salonului, pentru asistenții AI.
// Se generează la fiecare build din aceleași date ca site-ul (/admin), deci rămâne mereu actual.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import setari from '../data/setari.json';
import acasa from '../data/acasa.json';
import recenzii from '../data/recenzii.json';
import seo from '../data/seo.json';

const gol = (v?: string | null) => !v || /^\[.*\]$/.test(v.trim());
// primul paragraf al descrierii; rândurile se unesc, cu punct unde lipsea semnul de final
const primulParagraf = (t?: string | null) =>
  (t ?? '').split(/\n\s*\n/)[0].split('\n').map((r) => r.trim()).filter(Boolean)
    .map((r, i, all) => (i < all.length - 1 && !/[.!?:;,]$/.test(r) ? `${r}.` : r)).join(' ');

export const GET: APIRoute = async ({ site }) => {
  const url = (p: string) => new URL(p, site).toString();
  const servicii = (await getCollection('servicii')).sort((a, b) => a.data.ordine - b.data.ordine);
  const oferte = (await getCollection('oferte')).filter((o) => o.data.activ).sort((a, b) => a.data.ordine - b.data.ordine);
  const echipa = (await getCollection('echipa')).sort((a, b) => a.data.ordine - b.data.ordine);
  const pagini = await getCollection('pagini');
  const f = setari.firma;

  const L: string[] = [];
  L.push(`# ${setari.nume}`, '');
  L.push(`> ${setari.descriere_scurta}`, '');
  L.push(
    `${setari.nume} (${setari.semnatura}) este un salon de coafură și colorare din ${setari.oras}, România. ` +
      `Site-ul este în limba română. Programările se fac online, pe platforma Mero: ${setari.link_rezervare}. ` +
      'Prețurile de mai jos sunt cele afișate pe site; prețul final se confirmă în salon, după consultație.',
    '',
  );

  L.push('## Date de contact și program', '');
  L.push(`- Adresă: ${setari.adresa}, ${setari.oras}${gol(setari.adresa_detalii) ? '' : ` (${setari.adresa_detalii})`}`);
  L.push(`- Hartă: ${setari.link_harta}`);
  L.push(`- Telefon: ${setari.telefon}`);
  L.push(`- WhatsApp: https://wa.me/${setari.whatsapp}`);
  L.push(`- Email: ${setari.email}`);
  L.push(`- Programare online (Mero): ${setari.link_rezervare}`);
  for (const p of setari.program) L.push(`- Program ${p.zile}: ${p.ore}`);
  if (setari.instagram) L.push(`- Instagram: ${setari.instagram}`);
  if (setari.facebook) L.push(`- Facebook: ${setari.facebook}`);
  if (setari.tiktok) L.push(`- TikTok: ${setari.tiktok}`);
  L.push('');

  L.push('## Servicii și prețuri', '');
  for (const s of servicii) {
    L.push(`### [${s.data.titlu}](${url(`/servicii/${s.id}/`)})`, '');
    L.push(s.data.rezumat, '');
    for (const p of s.data.preturi) {
      const detalii = [p.durata, p.pret].filter(Boolean).join(', ');
      const desc = primulParagraf(p.descriere);
      L.push(`- ${p.nume} (${detalii})${desc ? `: ${desc}` : ''}`);
    }
    L.push('');
  }

  if (oferte.length) {
    L.push(`## [Oferte active](${url('/oferte/')})`, '');
    for (const o of oferte) {
      const pret = o.data.pret_vechi ? `${o.data.pret} în loc de ${o.data.pret_vechi}` : o.data.pret;
      const pana = o.data.valabil_pana ? `, valabilă până la ${o.data.valabil_pana}` : '';
      L.push(`- ${o.data.titlu}: ${pret}${pana}. ${o.data.detaliu}`);
    }
    L.push('');
  }

  L.push(`## [Echipa](${url('/echipa/')})`, '');
  for (const m of echipa) {
    const bio = gol(m.body) ? '' : `: ${primulParagraf(m.body)}`;
    L.push(`- ${m.data.nume}, ${m.data.rol}${bio}`);
  }
  L.push('');

  L.push('## Recenzii', '');
  L.push(`Nota ${recenzii.nota} din 5, din ${recenzii.numar} recenzii verificate pe ${recenzii.sursa}: ${recenzii.link}`, '');

  L.push('## Întrebări frecvente', '');
  for (const q of acasa.intrebari) L.push(`- **${q.intrebare}** ${q.raspuns}`);
  L.push('');

  L.push('## Pagini', '');
  const p = seo.pagini;
  L.push(`- [Acasă](${url('/')}): ${p.acasa.descriere}`);
  L.push(`- [Servicii și prețuri](${url('/servicii/')}): ${p.servicii.descriere}`);
  L.push(`- [Oferte](${url('/oferte/')}): ${p.oferte.descriere}`);
  L.push(`- [Galerie](${url('/galerie/')}): ${p.galerie.descriere}`);
  L.push(`- [Echipă](${url('/echipa/')}): ${p.echipa.descriere}`);
  L.push(`- [Despre noi](${url('/despre-noi/')}): ${p['despre-noi'].descriere}`);
  L.push('');

  L.push('## Informații legale', '');
  L.push(
    `Salonul este administrat de ${f.denumire}, CUI ${f.cui}, Nr. Reg. Com. ${f.reg_com}${gol(f.euid) ? '' : `, EUID ${f.euid}`}, ` +
      `cu sediul social în ${f.sediu}. Anularea sau neprezentarea la programare în ziua rezervării implică achitarea integrală a serviciului rezervat.`,
    '',
  );
  L.push(`- [Date identificare societate](${url('/date-identificare/')})`);
  for (const pg of pagini) L.push(`- [${pg.data.titlu}](${url(`/${pg.id}/`)}): ${pg.data.descriere}`);
  L.push('');

  return new Response(L.join('\n').replace(/\n{3,}/g, '\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
