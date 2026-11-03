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
| Date salon, contact, program, firmă, link rezervare | `src/data/setari.json` |
| Textele primei pagini | `src/data/acasa.json` |
| Galerie | `src/data/galerie.json` |
| Servicii (câte o pagină fiecare) | `src/content/servicii/*.md` |
| Echipă | `src/content/echipa/*.md` |
| Oferte | `src/content/oferte/*.md` |
| Pagini legale | `src/content/pagini/*.md` |

Panoul de administrare Decap CMS (`/admin`) este în lucru.

## De completat înainte de lansare

- textele dintre paranteze drepte `[...]` (oraș, adresă, telefon, date firmă);
- prețurile și duratele (acum sunt exemple);
- logo-ul (acum este un logo text în `src/components/Wordmark.astro`);
- fotografiile (până atunci, imaginile sunt mostre de păr desenate în tonurile paletei);
- `link_rezervare` în `src/data/setari.json`.
