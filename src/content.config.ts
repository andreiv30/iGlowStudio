import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Tonurile din paleta iGlow. Fiecare serviciu sau ofertă are un ton,
// folosit ca fundal până când se încarcă o fotografie din /admin.
export const tonuri = ['espresso', 'mocha', 'cacao', 'taupe', 'piatra', 'greige', 'caramel', 'auriu'] as const;

const servicii = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicii' }),
  schema: z.object({
    titlu: z.string(),
    rezumat: z.string(),
    ordine: z.number().default(10),
    durata: z.string(),
    pret_de_la: z.number(),
    ton: z.enum(tonuri).default('caramel'),
    imagine: z.string().optional().nullable(),
    imagine_alt: z.string().optional().nullable(),
    pasi: z
      .array(z.object({ titlu: z.string(), text: z.string() }))
      .default([]),
    preturi: z
      .array(z.object({ nume: z.string(), durata: z.string().optional().nullable(), pret: z.string() }))
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
    ordine: z.number().default(10),
    foto: z.string().optional().nullable(),
    ton: z.enum(tonuri).default('taupe'),
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
    ton: z.enum(tonuri).default('caramel'),
    imagine: z.string().optional().nullable(),
  }),
});

const pagini = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pagini' }),
  schema: z.object({
    titlu: z.string(),
    descriere: z.string(),
    actualizat: z.string(),
  }),
});

export const collections = { servicii, echipa, oferte, pagini };
