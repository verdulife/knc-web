import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/episodes" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    season: z.number(),
    episode: z.number(),
    thumbnail: z.string(),
    links: z.object({
      youtube: z.string().url(),
      spotify: z.string().url().nullable(),
    }),
    updatedAt: z.string().datetime(),
  }),
});

export const collections = { episodes };
