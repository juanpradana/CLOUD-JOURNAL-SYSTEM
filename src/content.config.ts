import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const jurnal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/jurnal" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    author_id: z.string().optional(),
    author_username: z.string().optional(),
    cover_image: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { jurnal };
