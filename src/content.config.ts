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
    /* "experience" = employment (Work Experience page); "project" = personal
       product (Projects page). One collection, two surfaces. */
    kind: z.enum(["experience", "project"]).default("experience"),
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

const books = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    status: z.enum([
      "currently-reading",
      "finished",
      "paused",
      "abandoned",
      "wishlist",
    ]),
    rating: z.number().min(1).max(5).optional(),
    startedAt: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional(),
    spineColor: z.string().default("#333333"),
    textColor: z.string().default("#FFFFFF"),
    cover: z.string().optional(),
    review: z.string().optional(),
    favoriteQuote: z.string().optional(),
    whyItMatters: z.string().optional(),
  }),
});

const films = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/films" }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    director: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    watchedAt: z.coerce.date().optional(),
    poster: z.string().optional(),
    review: z.string().optional(),
    favoriteMoment: z.string().optional(),
    recommendedFor: z.string().optional(),
    lists: z.array(z.string()).default([]),
  }),
});

const archive = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/archive" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(["note", "quote", "mental-model", "framework", "observation"]),
    date: z.coerce.date().optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { work, projects, blog, books, films, archive };
