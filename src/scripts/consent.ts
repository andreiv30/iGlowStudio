// Consimțământul pentru cookie-uri (Google Consent Mode v2).
// - În <head> (Base.astro), înainte de orice cod de tracking: totul refuzat implicit, apoi alegerea salvată, dacă există.
// - Aici: bannerul, fereastra de setări, salvarea alegerii și pornirea codurilor care așteaptă acordul.

type Alegere = { v: 1; t: number; analiza: boolean; marketing: boolean; preferinte: boolean };
type Categorie = 'analiza' | 'marketing' | 'preferinte';

const CHEIE = 'iglow_consent';
const VALABIL = 365 * 24 * 60 * 60 * 1000; // după un an întrebăm din nou

declare global {
  interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void; iglowConsent?: Alegere | null }
}

const gtag = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer || [];
  if (window.gtag) window.gtag(...args); else window.dataLayer.push(args);
};

function citeste(): Alegere | null {
  try {
    const a = JSON.parse(localStorage.getItem(CHEIE) || 'null') as Alegere | null;
    return a && a.v === 1 && Date.now() - a.t < VALABIL ? a : null;
  } catch { return null; }
}

function scrie(a: Alegere) {
  try { localStorage.setItem(CHEIE, JSON.stringify(a)); } catch { /* fără stocare: alegerea ține doar pe pagina curentă */ }
}

export function stareGoogle(a: Pick<Alegere, Categorie>) {
  const g = (ok: boolean) => (ok ? 'granted' : 'denied');
  return {
    analytics_storage: g(a.analiza),
    ad_storage: g(a.marketing),
    ad_user_data: g(a.marketing),
    ad_personalization: g(a.marketing),
    functionality_storage: g(a.preferinte),
    personalization_storage: g(a.preferinte),
    security_storage: 'granted',
  };
}

// Pornește codurile din /admin care așteptau acordul pentru categoriile permise.
function pornesteCoduri(a: Alegere) {
  document.querySelectorAll<HTMLElement>('[data-consent]').forEach((el) => {
    const cat = el.dataset.consent as Categorie;
    if (!a[cat] || el.dataset.consentDone) return;
    el.dataset.consentDone = '1';
    if (el.tagName === 'SCRIPT') {
      const s = document.createElement('script');
      for (const at of Array.from(el.attributes)) {
        if (at.name === 'type' || at.name.startsWith('data-consent')) continue;
        s.setAttribute(at.name, at.value);
      }
      s.text = (el as HTMLScriptElement).text;
      el.replaceWith(s);
    } else if (el.dataset.consentSrc) {
      el.setAttribute('src', el.dataset.consentSrc);
    }
  });
}

function aplica(a: Alegere, salvata: boolean) {
  const anterior = window.iglowConsent;
  window.iglowConsent = a;
  gtag('consent', 'update', stareGoogle(a));
  if (window.fbq) window.fbq('consent', a.marketing ? 'grant' : 'revoke');
  window.dataLayer.push({ event: 'consent_update', consent_analiza: a.analiza, consent_marketing: a.marketing, consent_preferinte: a.preferinte });
  pornesteCoduri(a);
  // Un cod deja pornit nu poate fi oprit; dacă vizitatorul retrage un acord, reîncărcăm pagina.
  if (salvata && anterior && ((anterior.analiza && !a.analiza) || (anterior.marketing && !a.marketing) || (anterior.preferinte && !a.preferinte))) {
    location.reload();
  }
}

const banner = document.querySelector<HTMLElement>('[data-cc-banner]');
const dialog = document.querySelector<HTMLDialogElement>('[data-cc-dialog]');
const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>('[data-cc-cat]'));

function salveaza(valori: Pick<Alegere, Categorie>) {
  const a: Alegere = { v: 1, t: Date.now(), ...valori };
  scrie(a);
  if (banner) banner.hidden = true;
  if (dialog?.open) dialog.close();
  aplica(a, true);
}

const toate = (ok: boolean) => ({ analiza: ok, marketing: ok, preferinte: ok });

function deschideSetari() {
  const a = window.iglowConsent || citeste();
  boxes().forEach((b) => { b.checked = Boolean(a && a[b.dataset.ccCat as Categorie]); });
  dialog?.showModal();
}

document.querySelectorAll('[data-cc-accept]').forEach((b) => b.addEventListener('click', () => salveaza(toate(true))));
document.querySelectorAll('[data-cc-reject]').forEach((b) => b.addEventListener('click', () => salveaza(toate(false))));
document.querySelector('[data-cc-settings]')?.addEventListener('click', deschideSetari);
document.querySelector('[data-cc-save]')?.addEventListener('click', () => {
  const v = toate(false);
  boxes().forEach((b) => { v[b.dataset.ccCat as Categorie] = b.checked; });
  salveaza(v);
});
// orice link sau buton cu data-consent-open (ex. „Setări cookie” din footer) redeschide preferințele
document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest('[data-consent-open]');
  if (!t) return;
  e.preventDefault();
  deschideSetari();
});

const existenta = citeste();
if (existenta) {
  aplica(existenta, false);
} else if (banner) {
  banner.hidden = false;
}
