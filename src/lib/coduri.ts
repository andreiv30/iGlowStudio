import coduri from '../data/coduri.json';

// Codurile din /admin → Setări și pagini → Coduri (Facebook Pixel, Google Tag Manager etc.).
// Categoria decide când rulează codul:
//   google     – rulează mereu; Google Tag Manager / GA4 respectă singure Consent Mode
//   necesare   – rulează mereu (cod strict necesar)
//   analiza, marketing, preferinte – rulează doar după acordul vizitatorului din bannerul de cookie
export type Cod = { nume: string; activ: boolean; locatie: 'head' | 'body_inceput' | 'body_final'; categorie: string; cod: string };

const mereu = new Set(['google', 'necesare']);

// Pentru categoriile cu acord, scripturile devin inactive (type="text/plain") până la acord,
// iar imaginile/iframe-urile își primesc adresa abia atunci. <noscript> se elimină:
// fără JavaScript vizitatorul nu poate da acordul, deci nu urmărim nimic.
export function blocheaza(html: string, categorie: string) {
  if (mereu.has(categorie)) return html;
  return html
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<script\b([^>]*)>/gi, (_m, attrs: string) => {
      const fara = attrs.replace(/\stype\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, '');
      return `<script type="text/plain" data-consent="${categorie}"${fara}>`;
    })
    .replace(/<(img|iframe)\b([^>]*?)\ssrc\s*=\s*("[^"]*"|'[^']*')([^>]*)>/gi, (_m, tag: string, a: string, src: string, b: string) =>
      `<${tag}${a} data-consent="${categorie}" data-consent-src=${src}${b}>`);
}

export function coduriPentru(locatie: Cod['locatie']) {
  return (coduri.coduri as Cod[])
    .filter((c) => c.activ !== false && c.locatie === locatie && c.cod?.trim())
    .map((c) => `<!-- ${c.nume.replace(/--/g, '')} -->\n${blocheaza(c.cod, c.categorie)}`)
    .join('\n');
}

