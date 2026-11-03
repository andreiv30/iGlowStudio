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

// ---------- video din hero: oprit pentru „reduce motion” și când nu se vede pe ecran ----------
const heroVideo = document.querySelector<HTMLVideoElement>('[data-hero-video]');
if (heroVideo) {
  if (reduce.matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
  else if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) heroVideo.play().catch(() => {}); else heroVideo.pause(); }).observe(heroVideo);
  }
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

  // drag cu mouse-ul pe desktop (pe telefon derularea cu degetul e nativă)
  if (!track.hasAttribute('data-drag')) return;
  let startX = 0, startLeft = 0, down = false, moved = false;
  track.addEventListener('dragstart', (e) => e.preventDefault());
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
  });
  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) < 5) return;
    if (!moved) { moved = true; track.classList.add('is-dragging'); track.setPointerCapture(e.pointerId); }
    track.scrollLeft = startLeft - dx;
  });
  const end = (e: PointerEvent) => {
    if (!down) return;
    down = false;
    if (!moved) return;
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
    // se așază pe cel mai apropiat card, apoi revine snap-ul
    const w = step();
    const target = Math.round(track.scrollLeft / w) * w;
    track.scrollTo({ left: target, behavior: reduce.matches ? 'auto' : 'smooth' });
    setTimeout(() => track.classList.remove('is-dragging'), 450);
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  // un drag nu deschide cardul de sub mouse
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
});

// ---------- recenzii: coloane care urcă în buclă (3 pe desktop, 2 pe tabletă, 1 pe telefon) ----------
document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((wrap) => {
  const list = wrap.querySelector<HTMLElement>('[data-marquee-list]');
  const viewport = list?.parentElement;
  const toggle = wrap.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
  const label = wrap.querySelector<HTMLElement>('[data-marquee-label]');
  if (!list || !viewport || reduce.matches) return;
  const items = [...list.children] as HTMLElement[];
  if (!items.length) return;
  const speeds = [26, 21, 30]; // pixeli pe secundă, ușor diferiți pe coloane
  let built = 0;

  const colCount = () => (innerWidth >= 1024 ? 3 : innerWidth >= 640 ? 2 : 1);
  const build = () => {
    const n = Math.min(colCount(), items.length);
    if (n === built) return;
    built = n;
    viewport.querySelector('.marquee__cols')?.remove();
    const cols = document.createElement('div');
    cols.className = 'marquee__cols';
    cols.style.setProperty('--cols', String(n));
    viewport.append(cols);
    wrap.classList.add('is-built');
    const height = viewport.clientHeight;
    for (let c = 0; c < n; c++) {
      const own = items.filter((_, i) => i % n === c);
      const col = document.createElement('div');
      col.className = 'marquee__col';
      const inner = document.createElement('div');
      inner.className = 'marquee__inner';
      const group = document.createElement('div');
      group.className = 'marquee__group';
      col.append(inner); inner.append(group); cols.append(col);
      // grupul trebuie să fie mai înalt decât fereastra, altfel bucla ar lăsa gol
      let guard = 0;
      do { own.forEach((it) => group.append(it.cloneNode(true))); guard++; } while (group.offsetHeight < height + 40 && guard < 12);
      const copy = group.cloneNode(true) as HTMLElement;
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      inner.append(copy);
      const h = group.offsetHeight;
      inner.style.setProperty('--dur', `${Math.round(h / speeds[c % speeds.length])}s`);
      inner.style.setProperty('--delay', `-${Math.round((h / speeds[c % speeds.length]) * (c * 0.37))}s`);
      // în bucla vizibilă, linkurile din copii nu primesc focus de două ori
      if (guard > 1) group.querySelectorAll<HTMLElement>('.rv').forEach((el, i) => { if (i >= own.length) { el.setAttribute('aria-hidden', 'true'); el.inert = true; } });
    }
  };
  build();
  let t = 0;
  window.addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(build, 200); });

  toggle?.addEventListener('click', () => {
    const paused = wrap.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? 'Pornește derularea' : 'Oprește derularea';
  });
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
