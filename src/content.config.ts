import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    authorRole: z.string().default('Student Researcher'),
    date: z.coerce.date(),
    category: z.enum(['Economics', 'Finance', 'Business']).optional(),
    excerpt: z.string(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { articles };
