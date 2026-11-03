# iGlow Studio

Site de prezentare pentru salonul iGlow Studio (Andreea Pamfiloiu Concept), construit cu Astro ca site **static** și găzduit în `public_html` (cPanel, fără Node.js). Panoul de administrare este Decap CMS, la `/admin`.

## Cum ajunge site-ul pe server

```
modificare în /admin sau în cod → commit pe main → GitHub Actions: build → ramura deploy
→ cPanel API: Update from Remote + Deploy HEAD Commit → public_html
```

Totul e automat, în aproximativ 1–2 minute după salvare. Pentru pasul din cPanel, adaugă în GitHub → Settings → Secrets and variables → Actions:

| Secret | Valoare |
| --- | --- |
| `CPANEL_HOST` | adresa cPanel, fără `https://` și fără port (din bara browserului când ești în cPanel) |
| `CPANEL_USER` | `elena44930` |
| `CPANEL_TOKEN` | token din cPanel → Security → Manage API Tokens → Create |

Fără aceste secrete, deploy-ul se face manual: cPanel → Git Version Control → Manage → Pull or Deploy → **Update from Remote**, apoi **Deploy HEAD Commit** (repo-ul trebuie să fie pe ramura `deploy`). `.cpanel.yml` (model în `cpanel/.cpanel.yml`) copiază `site/` în `/home/elena44930/public_html/`.

## Panoul de administrare (`/admin`)

Login cu **utilizator și parolă** (andreea, elena), verificat de PHP în `public/api/auth.php`. După o parolă corectă, panoul primește un token GitHub păstrat pe server și salvează modificările direct în repo. Formularul blochează o adresă IP pentru 15 minute după 5 parole greșite.

Configurare, o singură dată:

1. **Token GitHub:** https://github.com/settings/personal-access-tokens/new → *Fine-grained token*
   - Repository access: *Only select repositories* → `iGlowStudio`
   - Permissions → Repository permissions → **Contents: Read and write** (Metadata: Read se adaugă singur)
   - Expiration: alege o dată (ex. 1 an) și reînnoiește tokenul înainte să expire.
2. **Parole:** deschide `https://iglowstudio.ro/api/parola.php`, scrie parola și copiază codul generat (pagina nu salvează nimic).
3. **Fișierul de pe server:** în File Manager (cu *Show Hidden Files* bifat) creează `public_html/api/.config.php`:

```php
<?php
return [
  'site_url' => 'https://iglowstudio.ro',
  'github_token' => 'github_pat_...',
  'users' => [
    'andreea' => '$2y$10$...',
    'elena' => '$2y$10$...',
  ],
];
```

Fișierul nu este în repo, `.htaccess` îl blochează din browser, iar deploy-ul nu îl suprascrie. Pentru un utilizator nou se adaugă un rând în `users`; pentru a scoate pe cineva se șterge rândul.

## Video în hero

Din /admin → Pagina Acasă → „Fundalul de sus” alegi Poză sau Video. Videoul trebuie să fie **.webm** și de cel mult **20 MB**: panoul refuză fișierele mai mari, iar la salvare cere format .webm. La build, un video care nu respectă regulile (sau lipsește) este ignorat și se afișează poza. Videoul rulează fără sunet, în buclă; poza mare se vede până pornește și pe browserele care nu redau WebM. Videoul nu se descarcă deloc pentru „reduce motion”, „economizor de date” sau conexiuni 2G (rămâne poza), iar când hero-ul nu e pe ecran stă pe pauză.

Pentru viteză, ține videoul cât mai mic: 720p, fără sunet, ideal sub 5 MB (cel actual: 57 s, 720p, 4,7 MB). Exemplu de conversie cu ffmpeg:

```bash
ffmpeg -i original.mp4 -an -vf scale=1280:-2 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 hero-video.webm
```

## SEO

- Titlul și descrierea fiecărei pagini: /admin → Setări și pagini → **SEO** (`src/data/seo.json`). Serviciile au câmpuri SEO proprii; paginile legale folosesc descrierea lor.
- Imaginea pentru distribuiri (Facebook, WhatsApp): același ecran, „Imagine pentru distribuiri” (ideal 1200×630). Fără ea se folosește poza din hero.
- Generate automat: `robots.txt`, `sitemap.xml`, `llms.txt` (rezumat pentru asistenții AI: contact, program, servicii cu prețuri, oferte, întrebări frecvente), link canonic, Open Graph și Twitter Card, date structurate schema.org (HairSalon cu program și adresă, Service, BreadcrumbList, FAQPage).
- După lansare: adaugă site-ul în Google Search Console și trimite `https://iglowstudio.ro/sitemap.xml`; completează profilul Google Business cu aceeași adresă și același telefon ca pe site.

## Poze

La fiecare commit, GitHub Actions rulează `scripts/optimize-images.mjs`: pozele din `public/uploads` (JPG, PNG, HEIC etc.) devin WebP de cel mult 2400 px, cu nume fără diacritice; originalele se șterg, iar adresele din conținut se actualizează și se salvează înapoi pe `main`.

## Cookie-uri și coduri de tracking

- Banner de consimțământ cu Google Consent Mode v2: totul refuzat implicit; vizitatorul alege Acceptă toate / Refuză / Setări pe categorii (analiză, marketing, preferințe). Alegerea se ține 12 luni; „Setări cookie” din footer o redeschide.
- Codurile (Facebook Pixel, GTM, TikTok etc.) se adaugă din /admin → Setări și pagini → **Coduri** (`src/data/coduri.json`), cu locul (head / început body / sfârșit body) și categoria. Codurile de marketing, analiză și preferințe pornesc doar după acord; GTM/GA4 („google”) pornește mereu și respectă Consent Mode.
- Actualizează lista de servicii din `Politica cookie` când adaugi sau scoți un cod.

## Securitate

`public/.htaccess`: redirect la `https://iglowstudio.ro`, HSTS, antete de securitate (nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, CSP frame-ancestors), fișierele ascunse blocate, niciun script executabil în `uploads/`, fișierele interne ale login-ului blocate.
Generatorul de parole (`/api/parola.php`) se oprește singur după ce utilizatorii sunt configurați; pentru o parolă nouă se adaugă temporar `'generator_parole' => true` în `api/.config.php`.

## Dezvoltare locală

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # generează site-ul static în dist/
```

Necesită Node 22.12 sau mai nou (doar pentru build; serverul nu are nevoie de Node).

## Unde se editează conținutul

| Ce | Fișier |
| --- | --- |
| Date salon, contact, program, hartă, firmă, link rezervare Mero, bara de anunț | `src/data/setari.json` |
| Textele primei pagini (titlul și textul Echipei apar și pe pagina Echipă) | `src/data/acasa.json` |
| Pagina Despre noi | `src/data/despre.json` |
| Recenzii (preluate de pe Mero) | `src/data/recenzii.json` |
| Galerie (în /admin poți selecta mai multe poze deodată; widget în `public/admin/galerie-widget.js`) | `src/data/galerie.json` |
| Cardul „Pasul următor” de la finalul paginilor | `src/data/cta.json` |
| Servicii: o pagină pe categorie (Colorare, Tuns, Diagnoză & scalp, Tratamente, Vouchere cadou); serviciile individuale sunt în lista „Prețuri” a categoriei | `src/content/servicii/*.md` |
| Echipă | `src/content/echipa/*.md` |
| Oferte | `src/content/oferte/*.md` |
| Pagini legale | `src/content/pagini/*.md` |

## De completat înainte de lansare

- textele dintre paranteze drepte `[...]` (povestea din Despre noi, termenele din politici);
- logo-ul: `src/components/Logo.astro` este redesenat ca SVG după siglă; se poate înlocui cu fișierul original;
- fotografiile: locurile lor sunt goale până se încarcă din /admin (poza mare din Acasă, servicii, echipă, galerie);
- serviciile, prețurile, ofertele și recenziile sunt preluate de pe https://mero.ro/p/iglow-studio; când se schimbă acolo, se actualizează și din /admin.

Toate butoanele „Rezervă” duc la Mero (`link_rezervare`). Nu mai există pagina /rezerva: `.htaccess` o trimite la Mero, iar vechile adrese /servicii/vopsit, /balayage și /coafat la noile categorii.
