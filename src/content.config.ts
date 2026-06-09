import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    website: z.string().url(),
    order: z.number().default(0),
    hero: z.string().optional(),
    logo: z.string().optional(),
    photos: z
      .array(
        z.object({
          src: z.string(),
          caption: z.string().optional(),
          aspect: z.string().default("3 / 2"),
        }),
      )
      .default([]),
    projects: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          href: z.string().optional(),
        }),
      )
      .default([]),
    testimonial: z
      .object({
        quote: z.string(),
        author: z.string(),
        role: z.string().optional(),
      })
      .optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    period: z.string(),
    role: z.string().optional(),
    tags: z.array(z.string()).default([]),
    hero: z.string().optional(),
    photos: z
      .array(
        z.object({
          src: z.string(),
          caption: z.string().optional(),
          aspect: z.string().default("3 / 2"),
        }),
      )
      .default([]),
    external: z.string().url().optional(),
    order: z.number().default(0),
    idea: z.string(),
    problem: z.string(),
    solution: z.string(),
    whyUnique: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    readTime: z.string().optional(),
  }),
});

export const collections = { work, projects, blog };
