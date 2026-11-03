import setari from '../data/setari.json';

// Toate butoanele „Rezervă” duc la programările online (Mero); linkul se schimbă din /admin → Setări.
export const rezervaHref = setari.link_rezervare?.trim() || 'https://mero.ro/p/iglow-studio';
export const rezervaExtern = true;

// Linkurile interne se scriu cu „/” la final (/servicii/), exact ca adresa paginii de pe server.
// Fără el, serverul răspunde întâi cu o redirecționare (301) și pagina se deschide mai încet.
// cale() adaugă „/” și la linkurile scrise în /admin (ex. „/oferte” → „/oferte/”, „/oferte#x” → „/oferte/#x”).
export function cale(href: string) {
  const m = href.match(/^(\/[^?#]*?)([?#].*)?$/);
  if (!m || m[1].endsWith('/') || /\.[a-z0-9]+$/i.test(m[1])) return href;
  return `${m[1]}/${m[2] ?? ''}`;
}

export const meniu = [
  { href: '/', label: 'Acasă' },
  { href: '/servicii/', label: 'Servicii' },
  { href: '/oferte/', label: 'Oferte' },
  { href: '/galerie/', label: 'Galerie' },
  { href: '/echipa/', label: 'Echipă' },
  { href: '/despre-noi/', label: 'Despre noi' },
];

export const legale = [
  { href: '/date-identificare/', label: 'Date identificare societate' },
  { href: '/politica-de-confidentialitate/', label: 'Politica de confidențialitate' },
  { href: '/termeni-si-conditii/', label: 'Termeni și condiții' },
  { href: '/politica-cookie/', label: 'Politica cookie' },
];

// Text cu *cuvânt* → cuvânt evidențiat (italic auriu). Restul textului este escapat.
export function accent(text: string) {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
