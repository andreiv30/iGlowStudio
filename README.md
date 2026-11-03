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
| Date salon, contact, program, firmă, link rezervare, bara de anunț | `src/data/setari.json` |
| Textele primei pagini | `src/data/acasa.json` |
| Pagina Despre noi | `src/data/despre.json` |
| Recenzii | `src/data/recenzii.json` |
| Galerie | `src/data/galerie.json` |
| Servicii (câte o pagină fiecare) | `src/content/servicii/*.md` |
| Echipă | `src/content/echipa/*.md` |
| Oferte | `src/content/oferte/*.md` |
| Pagini legale | `src/content/pagini/*.md` |

## De completat înainte de lansare

- textele dintre paranteze drepte `[...]` (oraș, adresă, telefon, date firmă);
- prețurile și duratele (acum sunt exemple);
- logo-ul: `src/components/Logo.astro` este redesenat ca SVG după siglă; se poate înlocui cu fișierul original;
- fotografiile: locurile lor sunt goale până se încarcă din /admin (poza mare din Acasă, servicii, echipă, galerie);
- recenziile reale de pe Google (`src/data/recenzii.json`);
- `link_rezervare` în `src/data/setari.json`.
