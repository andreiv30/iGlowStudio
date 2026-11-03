// Comportamentul site-ului: header cu blur la scroll, anunțul de sus, meniul de pe mobil,
// intrările la scroll, mișcarea pozei din hero, caruselul de servicii și acordeonul din footer.

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------- header: blur după primii pixeli de scroll ----------
const onScroll = () => root.classList.toggle('header-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- anunțul de sus se poate închide ----------
document.querySelector('[data-bar-close]')?.addEventListener('click', () => {
  root.classList.add('bar-closed');
  try { sessionStorage.setItem('bar-closed', '1'); } catch {}
});

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
window.matchMedia('(min-width: 68.0625rem)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

// ---------- intrări la scroll (o singură dată, ca pe tasteskill.dev) ----------
const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
} else {
  targets.forEach((el) => el.classList.add('is-in'));
}

// ---------- poza din hero: urcă mai încet decât pagina (parallax) ----------
const heroMedia = document.querySelector<HTMLElement>('[data-parallax]');
if (heroMedia && !reduce.matches) {
  let ticking = false;
  const move = () => {
    const y = Math.min(window.scrollY, window.innerHeight);
    heroMedia.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
}

// ---------- carusel (servicii): săgețile derulează cu un card ----------
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((wrap) => {
  const track = wrap.querySelector<HTMLElement>('[data-track]');
  const prev = wrap.querySelector<HTMLButtonElement>('[data-prev]');
  const next = wrap.querySelector<HTMLButtonElement>('[data-next]');
  if (!track) return;
  const step = () => {
    const card = track.querySelector<HTMLElement>(':scope > *');
    return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || '0') : track.clientWidth;
  };
  const update = () => {
    if (prev) prev.disabled = track.scrollLeft < 4;
    if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  };
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// ---------- acordeonul din footer: pe mobil o singură secțiune deschisă, prima la început ----------
const accs = [...document.querySelectorAll<HTMLDetailsElement>('[data-acc]')];
const wide = window.matchMedia('(min-width: 48.0625rem)');
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
