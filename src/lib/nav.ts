import setari from '../data/setari.json';

// Toate butoanele „Rezervă” duc la programările online (Mero); linkul se schimbă din /admin → Setări.
export const rezervaHref = setari.link_rezervare?.trim() || 'https://mero.ro/p/iglow-studio';
export const rezervaExtern = true;

export const meniu = [
  { href: '/', label: 'Acasă' },
  { href: '/servicii', label: 'Servicii' },
  { href: '/oferte', label: 'Oferte' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/echipa', label: 'Echipă' },
  { href: '/despre-noi', label: 'Despre noi' },
];

export const legale = [
  { href: '/date-identificare', label: 'Date identificare societate' },
  { href: '/politica-de-confidentialitate', label: 'Politica de confidențialitate' },
  { href: '/termeni-si-conditii', label: 'Termeni și condiții' },
  { href: '/politica-cookie', label: 'Politica cookie' },
];

// Text cu *cuvânt* → cuvânt evidențiat (italic auriu). Restul textului este escapat.
export function accent(text: string) {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
