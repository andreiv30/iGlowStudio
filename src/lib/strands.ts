// Desenează șuvițe de păr în SVG, determinist (aceeași sămânță → același desen).
// Folosit ca imagine pentru servicii, oferte și echipă până se încarcă fotografii reale din /admin.

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export type Strand = { d: string; w: number; c: 'lo' | 'mid' | 'hi'; o: number };

// O șuviță prinsă sus (mostra coloristului): se lărgește, apoi se subțiază spre vârf.
export function hank(seed: number, count = 54): { strands: Strand[]; outline: string } {
  const r = rng(seed);
  const top = 92, belly = 470, tip = 760;
  const strands: Strand[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);                 // poziția pe lățime 0..1
    const x0 = 72 + t * 56;                    // la clemă
    const x1 = 30 + t * 140 + (r() - 0.5) * 8; // la burtă
    const x2 = 100 + (t - 0.5) * (40 + r() * 30); // la vârf
    const wave = 4 + r() * 6;
    const ph = r() * Math.PI * 2;
    const pts: string[] = [];
    const steps = 18;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const y = top + u * (tip - top - r() * 40 * u);
      // interpolare clemă → burtă → vârf
      const a = u < 0.55 ? u / 0.55 : 1;
      const b = u < 0.55 ? 0 : (u - 0.55) / 0.45;
      const xb = x0 + (x1 - x0) * Math.sin((a * Math.PI) / 2);
      const x = xb + (x2 - xb) * b * b + Math.sin(u * 7 + ph) * wave * Math.sin(u * Math.PI);
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    // lumina („glow”) cade pe o bandă oblică
    const glow = Math.abs(t - 0.35 - 0.0) < 0.16 && r() > 0.25;
    const c: Strand['c'] = glow ? 'hi' : r() < 0.32 ? 'lo' : 'mid';
    strands.push({ d: 'M' + pts.join(' L'), w: 2.2 + r() * 2.6, c, o: 0.75 + r() * 0.25 });
  }
  const outline = `M70 ${top} C40 220 18 380 30 470 C46 600 86 700 100 ${tip} C114 700 154 600 170 470 C182 380 160 220 130 ${top} Z`;
  return { strands, outline };
}

// Prim-plan: fire care umplu tot cadrul, cu o bandă de lumină în diagonală.
export function closeUp(seed: number, count = 150): Strand[] {
  const r = rng(seed);
  const out: Strand[] = [];
  for (let i = 0; i < count; i++) {
    const x0 = -40 + (i / count) * 880 + (r() - 0.5) * 10;
    const amp = 18 + r() * 26;
    const ph = r() * Math.PI * 2;
    const drift = 60 + r() * 50;
    const pts: string[] = [];
    for (let k = 0; k <= 24; k++) {
      const u = k / 24;
      const y = -20 + u * 1040;
      const x = x0 + Math.sin(u * 5.2 + ph) * amp + u * drift;
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    // banda de lumină: fire mai deschise pe o diagonală
    const d = Math.abs((x0 / 800) - 0.58);
    const c: Strand['c'] = d < 0.12 && r() > 0.2 ? 'hi' : r() < 0.4 ? 'lo' : 'mid';
    out.push({ d: 'M' + pts.join(' L'), w: 3 + r() * 5, c, o: 0.7 + r() * 0.3 });
  }
  return out;
}
