// Optimizează pozele încărcate din /admin (public/uploads):
// - JPG, PNG, TIFF, AVIF, HEIC → WebP (calitate 80), cel mult 2400 px pe latura mare, fără date EXIF
// - numele devin simple (fără diacritice și spații): „Listă Prețuri.png” → „lista-preturi.webp”
// - originalele se șterg, iar adresele din conținut (src/content, src/data) se actualizează
// - WebP-urile mai mari de 2400 px se micșorează pe loc
// Rulează în GitHub Actions înainte de build; schimbările se salvează înapoi pe main.
import { readdir, readFile, writeFile, unlink, stat, rename } from 'node:fs/promises';
import { join, extname, basename, dirname, relative } from 'node:path';
import sharp from 'sharp';

const UPLOADS = 'public/uploads';
const PUBLIC = '/uploads/';
const MAX = 2400;
const CONVERT = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.avif', '.heic', '.heif', '.bmp']);

const slug = (name) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[șş]/gi, 's').replace(/[țţ]/gi, 't')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'imagine';

async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else out.push(p);
  }
  return out;
}

const exists = (p) => stat(p).then(() => true, () => false);
const webPath = (p) => PUBLIC + relative(UPLOADS, p).split('\\').join('/');

async function freeName(dir, base) {
  let name = `${base}.webp`;
  for (let i = 2; await exists(join(dir, name)); i++) name = `${base}-${i}.webp`;
  return join(dir, name);
}

const renamed = new Map(); // „/uploads/vechi.png” → „/uploads/nou.webp”
let saved = 0;

for (const file of await files(UPLOADS)) {
  const ext = extname(file).toLowerCase();
  const dir = dirname(file);
  const base = basename(file, extname(file));
  const before = (await stat(file)).size;

  if (CONVERT.has(ext)) {
    const out = await freeName(dir, slug(base));
    await sharp(file).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(out);
    await unlink(file);
    const after = (await stat(out)).size;
    saved += before - after;
    renamed.set(webPath(file), webPath(out));
    console.log(`✓ ${webPath(file)} → ${webPath(out)} (${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB)`);
  } else if (ext === '.webp') {
    const meta = await sharp(file).metadata();
    if ((meta.width ?? 0) > MAX || (meta.height ?? 0) > MAX) {
      const buf = await sharp(file).rotate().resize({ width: MAX, height: MAX, fit: 'inside' }).webp({ quality: 80, effort: 5 }).toBuffer();
      await writeFile(file, buf);
      saved += before - buf.length;
      renamed.set(webPath(file), webPath(file));
      console.log(`✓ ${webPath(file)} micșorat la ${MAX} px`);
    }
    if (slug(base) !== base) {
      const out = await freeName(dir, slug(base));
      await rename(file, out);
      renamed.set(webPath(file), webPath(out));
      console.log(`✓ ${webPath(file)} → ${webPath(out)}`);
    }
  }
}

// Actualizează adresele în conținut. Decap poate scrie adresa și cu caractere codificate (%20).
// Repară și adresele vechi (.jpg/.png) rămase în conținut după o conversie anterioară,
// de ex. când cineva salvează din nou în /admin o pagină deschisă înainte de conversie.
const changes = [...renamed].filter(([from, to]) => from !== to);
const OLD_REF = /\/uploads\/[^"'\n)\]]+?\.(?:jpe?g|png|tiff?|avif|heic|heif|bmp)\b/gi;
const content = [...(await files('src/content')), ...(await files('src/data'))].filter((f) => /\.(md|json|ya?ml)$/.test(f));
for (const f of content) {
  let text = await readFile(f, 'utf8');
  const orig = text;
  for (const [from, to] of changes) {
    for (const variant of new Set([from, encodeURI(from)])) text = text.split(variant).join(to);
  }
  for (const ref of new Set(text.match(OLD_REF) ?? [])) {
    let decoded = ref;
    try { decoded = decodeURI(ref); } catch {}
    const rel = decoded.slice(PUBLIC.length);
    if (await exists(join(UPLOADS, rel))) continue;
    const webp = join(UPLOADS, dirname(rel), slug(basename(rel, extname(rel))) + '.webp');
    if (await exists(webp)) text = text.split(ref).join(webPath(webp));
  }
  if (text !== orig) {
    await writeFile(f, text);
    console.log(`  adrese actualizate în ${f}`);
  }
}

console.log(renamed.size ? `Gata: ${renamed.size} imagini, ${Math.round(saved / 1024)} KB economisiți.` : 'Nicio imagine de optimizat.');
