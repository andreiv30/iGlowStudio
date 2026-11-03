# iGlow Studio

Site de prezentare pentru salonul iGlow Studio (Andreea Pamfiloiu Concept), construit cu Astro ca site **static** și găzduit în `public_html` (cPanel, fără Node.js). Panoul de administrare este Decap CMS, la `/admin`.

## Cum ajunge site-ul pe server

```
modificare în /admin sau în cod  →  commit pe main  →  GitHub Actions: npm run build  →  FTP în public_html
```

Workflow-ul este în `.github/workflows/deploy.yml`. Adaugă în GitHub → Settings → Secrets and variables → Actions:

| Secret | Exemplu |
| --- | --- |
| `FTP_SERVER` | `ftp.iglowstudio.ro` |
| `FTP_USERNAME` | contul FTP din cPanel |
| `FTP_PASSWORD` | parola contului FTP |
| `FTP_SERVER_DIR` | `/public_html/` (sau `./` dacă FTP-ul pornește direct acolo) |
| `FTP_PROTOCOL` | opțional: `ftp` dacă serverul nu acceptă `ftps` |
| `SITE_URL` | `https://www.iglowstudio.ro` |
| `OAUTH_CLIENT_ID` | din GitHub OAuth App |
| `OAUTH_CLIENT_SECRET` | din GitHub OAuth App |

Fără secretele FTP, fiecare rulare produce o arhivă **site-public_html** (pagina rulării → Artifacts). Conținutul ei se urcă manual în `public_html` din File Manager.

## Panoul de administrare (`/admin`)

Autentificarea GitHub trece prin `public/api/auth.php` și `public/api/callback.php`, care rulează pe PHP-ul găzduirii.

1. Creează un GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps):
   - Homepage URL: `https://www.iglowstudio.ro`
   - Authorization callback URL: `https://www.iglowstudio.ro/api/callback.php`
2. Pune Client ID și Client Secret în secretele `OAUTH_CLIENT_ID` și `OAUTH_CLIENT_SECRET`. La deploy, workflow-ul scrie `api/.config.php` pe server; fișierul nu este în repo și `.htaccess` îl blochează.
3. Dacă domeniul diferă, schimbă `base_url`, `site_url` și `display_url` în `public/admin/config.yml`.

Pentru urcare manuală, creează pe server `public_html/api/.config.php`:

```php
<?php
return ['client_id' => '...', 'client_secret' => '...', 'site_url' => 'https://www.iglowstudio.ro'];
```

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
