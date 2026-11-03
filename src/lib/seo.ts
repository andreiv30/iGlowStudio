import seo from '../data/seo.json';
import setari from '../data/setari.json';
import acasa from '../data/acasa.json';

type Pagina = keyof typeof seo.pagini;

// Numele paginilor; titlul din Google se formează automat: „Nume pagină - iGlow Studio”.
const nume: Record<Pagina, string> = {
  acasa: 'Salon de înfrumusețare',
  servicii: 'Servicii și prețuri',
  oferte: 'Oferte',
  galerie: 'Galerie',
  echipa: 'Echipa',
  'despre-noi': 'Despre noi',
  'date-identificare': 'Date identificare societate',
};

// Titlul și descrierea unei pagini. Din /admin → SEO se poate scrie un titlu complet care îl înlocuiește pe cel automat.
export function seoPagina(cheie: Pagina) {
  const p = seo.pagini[cheie];
  return { title: nume[cheie], seoTitle: p.titlu?.trim() || undefined, description: p.descriere };
}

// Titlul complet: titlul SEO scris în admin, altfel „Nume pagină - iGlow Studio”.
export const titluComplet = (pagina: string, seoTitle?: string | null) => seoTitle?.trim() || `${pagina} - ${setari.nume}`;

// Textul alternativ al pozelor: cel scris în admin, altfel unul automat legat de salon.
export const altImg = (context: string, dat?: string | null) => dat?.trim() || `${context} - salon de înfrumusețare ${setari.nume}`;

// Imaginea pentru distribuiri (Facebook, WhatsApp): cea setată în SEO, altfel poza din hero.
export const imagineImplicita = seo.imagine_implicita || acasa.hero_imagine || '';

const zile: Record<string, string[]> = {
  'luni': ['Monday'], 'marți': ['Tuesday'], 'miercuri': ['Wednesday'], 'joi': ['Thursday'], 'vineri': ['Friday'], 'sâmbătă': ['Saturday'], 'duminică': ['Sunday'],
};
const ordine = ['luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă', 'duminică'];

// „Luni – Vineri” + „10:00 – 20:00” → specificații schema.org
function program() {
  const out: object[] = [];
  for (const p of setari.program) {
    const m = p.ore.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
    if (!m) continue;
    const parts = p.zile.toLowerCase().split(/\s*[–-]\s*/).map((z) => z.trim());
    let days: string[] = [];
    if (parts.length === 2 && ordine.includes(parts[0]) && ordine.includes(parts[1])) {
      days = ordine.slice(ordine.indexOf(parts[0]), ordine.indexOf(parts[1]) + 1).flatMap((z) => zile[z]);
    } else {
      days = parts.flatMap((z) => zile[z] ?? []);
    }
    if (days.length) out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: m[1], closes: m[2] });
  }
  return out;
}

const curat = (v?: string) => (v && !/^\[.*\]$/.test(v.trim()) ? v : undefined);

// Datele salonului pentru Google (schema.org HairSalon)
export function schemaSalon(site: URL) {
  const sameAs = [setari.instagram, setari.facebook, setari.tiktok].filter((u) => u && !/^https?:\/\/(www\.)?(instagram|facebook|tiktok)\.com\/?$/.test(u));
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': new URL('/#salon', site).toString(),
    name: setari.nume,
    description: setari.descriere_scurta,
    url: site.toString(),
    image: imagineImplicita ? new URL(imagineImplicita, site).toString() : undefined,
    telephone: /X/.test(setari.telefon) ? undefined : setari.telefon,
    email: setari.email,
    address: curat(setari.adresa) ? {
      '@type': 'PostalAddress',
      streetAddress: setari.adresa,
      addressLocality: curat(setari.oras),
      addressCountry: 'RO',
    } : undefined,
    openingHoursSpecification: program(),
    sameAs: sameAs.length ? sameAs : undefined,
    founder: { '@type': 'Person', name: 'Andreea Pamfiloiu' },
    priceRange: '$$',
  };
}

export function schemaBreadcrumb(site: URL, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: new URL(it.path, site).toString() })),
  };
}

export function schemaFaq(items: { intrebare: string; raspuns: string }[]) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({ '@type': 'Question', name: q.intrebare, acceptedAnswer: { '@type': 'Answer', text: q.raspuns } })),
  };
}
