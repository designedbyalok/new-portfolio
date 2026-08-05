import { createClient } from "@sanity/client";
import type { CMSPost } from "./cms";

// Sanity is the primary content source. Every query below projects documents
// straight into the site's CMSPost shape, so consuming pages never change.

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET ?? "production";
const token = import.meta.env.SANITY_TOKEN;

// A token lets the API return drafts as well as published documents, and with
// no perspective set that is exactly what happens — unpublished work leaks into
// production builds. Pin builds to published content, and opt into drafts only
// for a preview run via SANITY_PERSPECTIVE=drafts.
const perspective =
  (import.meta.env.SANITY_PERSPECTIVE as "published" | "drafts" | "raw") ?? "published";

const client = projectId
  ? createClient({
      projectId,
      dataset,
      token,
      perspective,
      apiVersion: "2026-01-01",
      useCdn: false, // build-time fetch — always fresh
    })
  : null;

// One GROQ projection per document type, returning the CMSPost shape.
const QUERIES: Record<string, string> = {
  post: `*[_type == "post"] | order(publishedAt desc) {
    title, "slug": slug.current, "markdownContent": coalesce(body, ""),
    "description": coalesce(seoDescription, ""), "thumbnail": thumbnail.asset->url,
    "collection": "blog", "metadata": {}, "date": publishedAt, "updated": _updatedAt
  }`,
  book: `*[_type == "book"] {
    title, "slug": slug.current, "markdownContent": coalesce(body, ""),
    "description": coalesce(review, title), "thumbnail": cover.asset->url,
    "collection": "books", "date": coalesce(finishedAt, startedAt),
    "metadata": { author, status, rating, startedAt, finishedAt,
      spineColor, textColor, "cover": cover.asset->url, review, favoriteQuote, whyItMatters }
  }`,
  film: `*[_type == "film"] {
    title, "slug": slug.current, "markdownContent": coalesce(body, ""),
    "description": coalesce(review, title), "thumbnail": poster.asset->url,
    "collection": "films", "date": watchedAt,
    "metadata": { year, director, rating, watchedAt,
      "poster": poster.asset->url, review, favoriteMoment, recommendedFor, lists }
  }`,
  archiveEntry: `*[_type == "archiveEntry"] {
    title, "slug": slug.current, "markdownContent": coalesce(body, ""),
    "description": title, "collection": "archive", "date": date,
    "metadata": { type, date, source, tags }
  }`,
  work: `*[_type == "work"] | order(order desc) {
    "title": company, "slug": slug.current, "markdownContent": coalesce(body, ""),
    "description": summary, "thumbnail": hero.asset->url, "collection": "work",
    "metadata": { company, kind, "caseStudies": caseStudies[]->slug.current, role, period, summary, website, "order": order,
      "hero": hero.asset->url, "logo": logo.asset->url,
      "photos": photos[]{ "src": image.asset->url, caption, aspect },
      projects, testimonial }
  }`,
  idea: `*[_type == "idea"] | order(order asc) {
    title, "slug": slug.current, "markdownContent": coalesce(body, ""),
    "description": tagline, "thumbnail": hero.asset->url, "collection": "ideas",
    "metadata": { tagline, period, role, tags, "hero": hero.asset->url,
      external, "order": order, idea, problem, solution, whyUnique,
      "photos": photos[]{ "src": image.asset->url, caption, aspect } }
  }`,
  photo: `*[_type == "photo"] | order(takenAt desc) {
    "title": coalesce(caption, "Photo"), "slug": _id, "markdownContent": "",
    "description": coalesce(caption, ""), "thumbnail": image.asset->url,
    "collection": "photos", "date": takenAt,
    "metadata": { caption, alt, aspect, takenAt, location }
  }`,
};

const cache = new Map<string, Promise<CMSPost[]>>();

/**
 * Fetch a Sanity document type, shaped as CMSPost[]. Returns [] when Sanity
 * isn't configured or the query fails, so callers fall through to their
 * existing source (WriterPro / local MDX) during the migration window.
 */
export function fetchSanity<M = Record<string, unknown>>(
  type: keyof typeof QUERIES,
): Promise<CMSPost<M>[]> {
  if (!client) return Promise.resolve([]);
  if (!cache.has(type)) {
    cache.set(
      type,
      client.fetch<CMSPost[]>(QUERIES[type]).catch((err) => {
        console.warn(`[sanity] "${type}" unavailable: ${err?.message ?? err}`);
        return [];
      }),
    );
  }
  return cache.get(type)! as Promise<CMSPost<M>[]>;
}
