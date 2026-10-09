import { getCollection } from "astro:content";
import { excerpt } from "./text";

export { excerpt };

/** Normalized post shape used by all pages, whatever the source. */
export interface CMSPost<M = Record<string, unknown>> {
  title: string;
  slug: string;
  markdownContent: string;
  description: string;
  thumbnail?: string;
  /** Collection name (defaults to "blog"). */
  collection: string;
  /** Typed fields published alongside the post — shape depends on collection. */
  metadata: M;
  /** ISO date string */
  date?: string;
  /** ISO date string of last edit */
  updated?: string;
}

/** Local MDX posts double as the blog fallback so builds never depend on the CMS being up. */
async function getLocalPosts(): Promise<CMSPost[]> {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries.map((entry) => ({
    title: entry.data.title,
    slug: entry.id,
    markdownContent: entry.body ?? "",
    description: excerpt(entry.data.description || entry.body || ""),
    thumbnail: entry.data.thumbnail,
    collection: "blog",
    metadata: {},
    date: entry.data.date.toISOString(),
  }));
}

/**
 * Blog posts: Mantel first, then Sanity, then local MDX — so an outage can
 * never break the build.
 */
export async function getAllPosts(): Promise<CMSPost[]> {
  const { fetchMantel } = await import("./mantel");
  const mantel = await fetchMantel("blog");
  if (mantel) return mantel;
  const { fetchSanity } = await import("./sanity");
  const sanity = await fetchSanity("post");
  if (sanity.length > 0) return sanity;
  return (await getLocalPosts()).sort(byDateDesc);
}

function byDateDesc(a: CMSPost, b: CMSPost): number {
  return (
    (b.date ? new Date(b.date).getTime() : 0) -
    (a.date ? new Date(a.date).getTime() : 0)
  );
}
