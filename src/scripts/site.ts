// Comportamentul site-ului: header cu blur la scroll, meniul de pe mobil,
// intrările la scroll, acordeonul din footer și mostrele de nuanță.

const root = document.documentElement;

// ---------- header: blur după primii pixeli de scroll ----------
const onScroll = () => root.classList.toggle('header-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- meniul de pe mobil ----------
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const panel = document.querySelector<HTMLElement>('[data-menu]');
const label = document.querySelector<HTMLElement>('[data-menu-label]');
const setMenu = (open: boolean) => {
  if (!toggle || !panel) return;
  toggle.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  root.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (label) label.textContent = open ? 'Închide meniul' : 'Deschide meniul';
};
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle?.focus(); }
});
window.matchMedia('(min-width: 64.0625rem)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

// ---------- intrări la scroll (o singură dată) ----------
const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-shutter]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  // plasă de siguranță: nimic nu rămâne ascuns dacă observatorul nu a pornit
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
} else {
  targets.forEach((el) => el.classList.add('is-in'));
}

// ---------- acordeonul din footer: pe mobil o singură secțiune deschisă, prima la început ----------
const accs = [...document.querySelectorAll<HTMLDetailsElement>('[data-acc]')];
const wide = window.matchMedia('(min-width: 56.0625rem)');
const syncAcc = () => {
  if (wide.matches) accs.forEach((d) => (d.open = true));
  else accs.forEach((d, i) => (d.open = i === 0));
};
syncAcc();
wide.addEventListener('change', syncAcc);
accs.forEach((d) => {
  d.querySelector('summary')?.addEventListener('click', (e) => {
    if (wide.matches) { e.preventDefault(); return; }
    if (!d.open) accs.forEach((other) => { if (other !== d) other.open = false; });
  });
});

// ---------- mostrele de nuanță din prima pagină ----------
document.querySelectorAll<HTMLElement>('[data-shades]').forEach((group) => {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-shade]')];
  const out = group.querySelector<HTMLElement>('[data-shade-out]');
  const pick = (btn: HTMLButtonElement) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    group.style.setProperty('--picked', btn.dataset.color || '');
    if (!out) return;
    out.querySelector('[data-shade-name]')!.textContent = btn.dataset.name || '';
    out.querySelector('[data-shade-text]')!.textContent = btn.dataset.text || '';
    const link = out.querySelector<HTMLAnchorElement>('[data-shade-link]');
    if (link) { link.href = btn.dataset.href || '/servicii'; link.querySelector('span')!.textContent = btn.dataset.service || 'Servicii'; }
  };
  buttons.forEach((b) => {
    b.addEventListener('click', () => pick(b));
    b.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) pick(b); });
  });
});

// ---------- lista de servicii: rândul activ schimbă imaginea fixată ----------
document.querySelectorAll<HTMLElement>('[data-service-list]').forEach((list) => {
  const rows = [...list.querySelectorAll<HTMLElement>('[data-row]')];
  const pics = [...list.querySelectorAll<HTMLElement>('[data-pic]')];
  const activate = (id: string) => {
    rows.forEach((r) => r.classList.toggle('is-active', r.dataset.row === id));
    pics.forEach((p) => p.classList.toggle('is-active', p.dataset.pic === id));
  };
  rows.forEach((r) => {
    r.addEventListener('mouseenter', () => activate(r.dataset.row!));
    r.addEventListener('focusin', () => activate(r.dataset.row!));
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activate((e.target as HTMLElement).dataset.row!); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    rows.forEach((r) => io.observe(r));
  }
});
