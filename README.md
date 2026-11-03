# iGlow Studio

Site de prezentare pentru salonul iGlow Studio (Andreea Pamfiloiu Concept), construit cu Astro și adapterul Node, găzduit pe cPanel.

## Comenzi

```bash
npm install
npm run dev      # dezvoltare locală, http://localhost:4321
npm run build    # construiește în dist/
npm start        # pornește serverul: node ./dist/server/entry.mjs
```

Necesită Node 22.12 sau mai nou (în cPanel: aplicație Node.js 22).

## Unde se editează conținutul

| Ce | Fișier |
| --- | --- |
| Date salon, contact, program, firmă, link rezervare, bara de anunț | `src/data/setari.json` |
| Pagina Despre noi | `src/data/despre.json` |
| Recenzii | `src/data/recenzii.json` |
| Textele primei pagini | `src/data/acasa.json` |
| Galerie | `src/data/galerie.json` |
| Servicii (câte o pagină fiecare) | `src/content/servicii/*.md` |
| Echipă | `src/content/echipa/*.md` |
| Oferte | `src/content/oferte/*.md` |
| Pagini legale | `src/content/pagini/*.md` |

## Panoul de administrare (`/admin`)

Decap CMS, cu autentificare GitHub prin rutele `/api/auth` și `/api/callback` ale aceleiași aplicații Node.

1. Creează un GitHub OAuth App (Settings → Developer settings → OAuth Apps):
   Homepage URL `https://www.iglowstudio.ro`, Authorization callback URL `https://www.iglowstudio.ro/api/callback`.
2. În cPanel, la aplicația Node, adaugă variabilele `SITE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (vezi `.env.example`).
3. Dacă domeniul diferă, schimbă `base_url`, `site_url` și `display_url` în `public/admin/config.yml`.

Fiecare salvare din admin face un commit pe `main`. Site-ul se actualizează după un nou build și deploy din cPanel.

## De completat înainte de lansare

- textele dintre paranteze drepte `[...]` (oraș, adresă, telefon, date firmă);
- prețurile și duratele (acum sunt exemple);
- logo-ul: `src/components/Logo.astro` este redesenat ca SVG după siglă; se poate înlocui cu fișierul original;
- fotografiile: locurile lor sunt goale până se încarcă din /admin (poza mare din Acasă, servicii, echipă, galerie);
- recenziile reale de pe Google (`src/data/recenzii.json`);
- `link_rezervare` în `src/data/setari.json`.
