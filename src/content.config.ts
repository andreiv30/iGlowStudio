import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const servicii = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicii' }),
  schema: z.object({
    slug: z.string().optional(),
    titlu: z.string(),
    rezumat: z.string(),
    eticheta: z.string().default(''),
    icon: z.string().default('scissors'),
    ordine: z.number().default(10),
    durata: z.string(),
    pret_de_la: z.number(),
    imagine: z.string().optional().nullable(),
    imagine_alt: z.string().optional().nullable(),
    imagine_detaliu: z.string().optional().nullable(),
    seo_titlu: z.string().optional().nullable(),
    seo_descriere: z.string().optional().nullable(),
    pasi: z
      .array(z.object({ titlu: z.string(), text: z.string() }))
      .default([]),
    preturi: z
      .array(z.object({ nume: z.string(), descriere: z.string().optional().nullable(), durata: z.string().optional().nullable(), pret: z.string() }))
      .default([]),
    intrebari: z
      .array(z.object({ intrebare: z.string(), raspuns: z.string() }))
      .default([]),
  }),
});

const echipa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/echipa' }),
  schema: z.object({
    nume: z.string(),
    rol: z.string(),
    rezumat: z.string().optional().nullable(),
    ordine: z.number().default(10),
    foto: z.string().optional().nullable(),
    servicii: z.array(z.string()).default([]),
  }),
});

const oferte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/oferte' }),
  schema: z.object({
    titlu: z.string(),
    detaliu: z.string(),
    pret: z.string(),
    pret_vechi: z.string().optional().nullable(),
    valabil_pana: z.string().optional().nullable(),
    activ: z.boolean().default(true),
    ordine: z.number().default(10),
    eticheta: z.string().optional().nullable(),
    imagine: z.string().optional().nullable(),
  }),
});

const pagini = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pagini' }),
  schema: z.object({
    titlu: z.string(),
    descriere: z.string(),
    actualizat: z.string(),
    seo_titlu: z.string().optional().nullable(),
  }),
});

export const collections = { servicii, echipa, oferte, pagini };
