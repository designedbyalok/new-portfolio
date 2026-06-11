import { getCollection } from "astro:content";

const API_URL =
  import.meta.env.CMS_API_URL ?? "https://writerpro.vercel.app/api/cms/posts";
const API_KEY = import.meta.env.CMS_API_KEY;

/** Normalized post shape used by all pages, whatever the source. */
export interface CMSPost {
  title: string;
  slug: string;
  markdownContent: string;
  description: string;
  thumbnail?: string;
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

function normalize(post: WriterProPost): CMSPost {
  // seoDescription from the CMS often contains raw markdown (leading #/###,
  // newlines) — always run descriptions through excerpt() so meta tags, OG,
  // JSON-LD, RSS and llms.txt get clean single-line prose.
  return {
    title: post.title,
    slug: post.slug,
    markdownContent: post.markdownContent,
    description: excerpt(post.seoDescription || post.markdownContent),
    thumbnail: post.thumbnailUrl || undefined,
    date: post.publishedAt,
    updated: post.updatedAt,
  };
}

/** Local MDX posts double as the fallback so builds never depend on the CMS being up. */
async function getLocalPosts(): Promise<CMSPost[]> {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries.map((entry) => ({
    title: entry.data.title,
    slug: entry.id,
    markdownContent: entry.body ?? "",
    description: excerpt(entry.data.description || entry.body || ""),
    thumbnail: entry.data.thumbnail,
    date: entry.data.date.toISOString(),
  }));
}

let cached: Promise<CMSPost[]> | null = null;

/**
 * Posts from WriterPro (source of truth for the blog), newest first.
 * Falls back to the local content collection if the CMS is unreachable,
 * so a CMS outage can never break the build.
 */
export function getAllPosts(): Promise<CMSPost[]> {
  cached ??= (async () => {
    try {
      if (!API_KEY) throw new Error("CMS_API_KEY is not set");
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`CMS responded ${response.status} ${response.statusText}`);
      }
      const posts = (await response.json()) as WriterProPost[];
      return posts.map(normalize).sort(byDateDesc);
    } catch (error) {
      console.warn(
        `[cms] Falling back to local blog content: ${error instanceof Error ? error.message : error}`,
      );
      return (await getLocalPosts()).sort(byDateDesc);
    }
  })();
  return cached;
}

function byDateDesc(a: CMSPost, b: CMSPost): number {
  return (
    (b.date ? new Date(b.date).getTime() : 0) -
    (a.date ? new Date(a.date).getTime() : 0)
  );
}

export async function getPostBySlug(slug: string): Promise<CMSPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}
