import { getCollection } from "astro:content";

const API_URL =
  import.meta.env.CMS_API_URL ?? "https://writerpro.vercel.app/api/cms/posts";
const API_KEY = import.meta.env.CMS_API_KEY;

/** Normalized post shape used by all pages, whatever the source. */
export interface CMSPost<M = Record<string, unknown>> {
  title: string;
  slug: string;
  markdownContent: string;
  description: string;
  thumbnail?: string;
  /** Free-form collection name set in WriterPro (defaults to "blog"). */
  collection: string;
  /** Typed fields published alongside the post — shape depends on collection. */
  metadata: M;
  /** ISO date string */
  date?: string;
  /** ISO date string of last edit */
  updated?: string;
}

/** Raw shape returned by the WriterPro API. */
interface WriterProPost {
  id: string;
  slug: string;
  title: string;
  markdownContent: string;
  seoTitle?: string;
  seoDescription?: string;
  thumbnailUrl?: string;
  collection?: string;
  metadata?: Record<string, unknown> | null;
  publishedAt?: string;
  updatedAt?: string;
}

/** First ~160 chars of plain text, for meta descriptions when the CMS has none. */
export function excerpt(markdown: string, max = 160): string {
  const text = markdown
    .replace(/<[^>]+>/g, " ") // strip inline HTML (WriterPro emits tables etc.)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[\s>#*_~|]*[-*+]\s+/gm, "") // leading list markers / blockquote
    .replace(/^-{3,}\s*$/gm, " ") // horizontal rules
    .replace(/[#>*_`~|]/g, " ") // remaining inline markdown (keep in-word hyphens)
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function normalize<M = Record<string, unknown>>(post: WriterProPost): CMSPost<M> {
  // seoDescription from the CMS often contains raw markdown (leading #/###,
  // newlines) — always run descriptions through excerpt() so meta tags, OG,
  // JSON-LD, RSS and llms.txt get clean single-line prose.
  return {
    title: post.title,
    slug: post.slug,
    markdownContent: post.markdownContent,
    description: excerpt(post.seoDescription || post.markdownContent),
    thumbnail: post.thumbnailUrl || undefined,
    collection: post.collection || "blog",
    metadata: (post.metadata ?? {}) as M,
    date: post.publishedAt,
    updated: post.updatedAt,
  };
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

const cache = new Map<string, Promise<CMSPost[]>>();

async function fetchCollection<M>(collection: string): Promise<CMSPost<M>[]> {
  if (!API_KEY) throw new Error("CMS_API_KEY is not set");
  const url = new URL(API_URL);
  url.searchParams.set("collection", collection);
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`CMS responded ${response.status} ${response.statusText}`);
  }
  const posts = (await response.json()) as WriterProPost[];
  return posts.map((p) => normalize<M>(p)).sort(byDateDesc);
}

/**
 * Posts from a WriterPro collection, newest first.
 *
 * For the "blog" collection, falls back to local MDX if the CMS is unreachable,
 * so a CMS outage can never break the build. Other collections return [] on
 * failure — they only live in WriterPro.
 */
export function getPostsByCollection<M = Record<string, unknown>>(
  collection: string,
): Promise<CMSPost<M>[]> {
  const key = collection;
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        try {
          return await fetchCollection<M>(collection);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (collection === "blog") {
            console.warn(`[cms] Falling back to local blog content: ${msg}`);
            return (await getLocalPosts()).sort(byDateDesc);
          }
          console.warn(`[cms] Collection "${collection}" unavailable: ${msg}`);
          return [];
        }
      })() as Promise<CMSPost[]>,
    );
  }
  return cache.get(key)! as Promise<CMSPost<M>[]>;
}

/** Convenience wrapper for the blog — kept for backwards-compat with existing callers. */
export function getAllPosts(): Promise<CMSPost[]> {
  return getPostsByCollection("blog");
}

function byDateDesc(a: CMSPost, b: CMSPost): number {
  return (
    (b.date ? new Date(b.date).getTime() : 0) -
    (a.date ? new Date(a.date).getTime() : 0)
  );
}

export async function getPostBySlug(
  slug: string,
  collection = "blog",
): Promise<CMSPost | undefined> {
  const posts = await getPostsByCollection(collection);
  return posts.find((post) => post.slug === slug);
}
