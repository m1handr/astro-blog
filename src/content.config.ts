import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    pubDate: z.coerce.date(),
    heroImage: z.string(),
  }),
});

export const collections = { blog };
