import type { CMSPost } from "./cms";
import { excerpt } from "./text";

// Turns Mantel's content API into the CMSPost shapes the readers already return,
// so pages don't change. No Astro imports here, so it can be tested on its own.

export type MantelCollection =
  | "blog"
  | "work"
  | "projects"
  | "caseStudies"
  | "books"
  | "films"
  | "archive"
  | "photos";

/** A piece as the published snapshot (or the preview endpoint) returns it. */
export interface MantelPiece {
  id: string;
  collection: MantelCollection;
  slug: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  description?: string;
  featured?: boolean;
  archived?: boolean;
  sortOrder?: number;
  publishedAt?: string;
  updatedAt?: string;
  /** Only on the preview feed, which carries drafts as well. */
  status?: "published" | "draft";
}

export interface MantelAsset {
  id: string;
  path: string;
  width: number;
  height: number;
  alt?: string;
  caption?: string;
}

export interface MantelContent {
  id?: string;
  items: MantelPiece[];
  assets?: MantelAsset[];
}

/** The site's own collection names, as the readers use them. */
export type SiteCollection = "blog" | "books" | "films" | "archive" | "work" | "ideas" | "photos";

/**
 * Which Mantel collections feed each site collection. Work experience and side projects share the
 * site's work reader (split by kind); Mantel's case studies are the site's /case-studies.
 */
export const SOURCES: Record<SiteCollection, MantelCollection[]> = {
  blog: ["blog"],
  books: ["books"],
  films: ["films"],
  archive: ["archive"],
  work: ["work", "projects"],
  ideas: ["caseStudies"],
  photos: ["photos"],
};

type Meta = Record<string, unknown>;

function str(meta: Meta, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function num(meta: Meta, key: string): number | undefined {
  const value = meta[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function list(meta: Meta, key: string): string[] {
  const value = meta[key];
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === "string");
  if (typeof value === "string" && value.trim()) return value.split(",").map((part) => part.trim()).filter(Boolean);
  return [];
}

/** An image field: a URL string, or an object carrying one. */
function image(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const record = value as Meta;
    return image(record.src) ?? image(record.url) ?? image(record.image);
  }
  return undefined;
}

function record<T>(value: unknown): T | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : undefined;
}

function gallery(value: unknown): Array<{ src: string; caption?: string; aspect?: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const src = image(entry);
    if (!src) return [];
    const meta = record<Meta>(entry) ?? {};
    return [{ src, caption: str(meta, "caption"), aspect: str(meta, "aspect") }];
  });
}

/** Related pieces as slugs: local files list slugs, Sanity imports keep { _ref } links to other documents. */
function slugList(value: unknown, slugs: Map<string, string>): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string" && entry.trim()) return [entry];
    const ref = record<Meta>(entry)?._ref;
    const slug = typeof ref === "string" ? slugs.get(ref.replace(/^drafts\./, "")) : undefined;
    return slug ? [slug] : [];
  });
}

function aspectOf(src: string | undefined, assets: MantelAsset[]): string | undefined {
  if (!src) return undefined;
  const asset = assets.find((entry) => src === entry.path || src.endsWith(new URL(entry.path, "http://x").pathname));
  return asset && asset.width && asset.height ? `${asset.width} / ${asset.height}` : undefined;
}

function base(piece: MantelPiece, collection: SiteCollection) {
  return {
    title: piece.title,
    slug: piece.slug,
    markdownContent: piece.body ?? "",
    collection,
    updated: piece.publishedAt ?? piece.updatedAt,
  };
}

function toPost(piece: MantelPiece, collection: SiteCollection, assets: MantelAsset[], slugs: Map<string, string>): CMSPost {
  const m = piece.metadata ?? {};
  const own = piece.description?.trim() || undefined;
  switch (collection) {
    case "blog":
      return {
        ...base(piece, collection),
        description: excerpt(own ?? str(m, "seoDescription", "description") ?? piece.body ?? ""),
        thumbnail: image(m.thumbnail) ?? image(m.image),
        metadata: {},
        date: str(m, "publishedAt", "date"),
      };
    case "books": {
      const cover = image(m.cover) ?? image(m.image);
      return {
        ...base(piece, collection),
        description: str(m, "review") ?? own ?? piece.title,
        thumbnail: cover,
        metadata: {
          author: str(m, "author") ?? "",
          status: str(m, "status") ?? "finished",
          rating: num(m, "rating"),
          startedAt: str(m, "startedAt"),
          finishedAt: str(m, "finishedAt"),
          spineColor: str(m, "spineColor"),
          textColor: str(m, "textColor"),
          cover,
          review: str(m, "review"),
          favoriteQuote: str(m, "favoriteQuote"),
          whyItMatters: str(m, "whyItMatters"),
        },
        date: str(m, "finishedAt", "startedAt"),
      };
    }
    case "films": {
      const poster = image(m.poster) ?? image(m.image);
      return {
        ...base(piece, collection),
        description: str(m, "review") ?? own ?? piece.title,
        thumbnail: poster,
        metadata: {
          year: num(m, "year"),
          director: str(m, "director"),
          rating: num(m, "rating"),
          watchedAt: str(m, "watchedAt"),
          poster,
          review: str(m, "review"),
          favoriteMoment: str(m, "favoriteMoment"),
          recommendedFor: str(m, "recommendedFor"),
          lists: list(m, "lists"),
        },
        date: str(m, "watchedAt"),
      };
    }
    case "archive":
      return {
        ...base(piece, collection),
        description: piece.title,
        metadata: { type: str(m, "type") ?? "note", date: str(m, "date"), source: str(m, "source"), tags: list(m, "tags") },
        date: str(m, "date"),
      };
    case "work": {
      const hero = image(m.hero) ?? image(m.image);
      const company = str(m, "company") ?? piece.title;
      return {
        ...base(piece, collection),
        title: company,
        description: str(m, "summary") ?? own ?? "",
        thumbnail: hero,
        metadata: {
          company,
          kind: piece.collection === "projects" || str(m, "kind") === "project" ? "project" : "experience",
          caseStudies: slugList(m.caseStudies, slugs),
          role: str(m, "role") ?? "",
          period: str(m, "period") ?? "",
          summary: str(m, "summary") ?? own ?? "",
          website: str(m, "website"),
          order: num(m, "order"),
          hero,
          logo: image(m.logo),
          photos: gallery(m.photos),
          projects: Array.isArray(m.projects) ? m.projects : [],
          testimonial: record(m.testimonial),
        },
      };
    }
    case "ideas": {
      const hero = image(m.hero) ?? image(m.image);
      return {
        ...base(piece, collection),
        description: str(m, "tagline") ?? own ?? "",
        thumbnail: hero,
        metadata: {
          tagline: str(m, "tagline") ?? own ?? "",
          period: str(m, "period") ?? "",
          role: str(m, "role"),
          tags: list(m, "tags"),
          hero,
          external: str(m, "external"),
          order: num(m, "order"),
          idea: str(m, "idea") ?? "",
          problem: str(m, "problem") ?? "",
          solution: str(m, "solution") ?? "",
          whyUnique: str(m, "whyUnique", "outcome") ?? "",
          photos: gallery(m.photos),
        },
      };
    }
    case "photos": {
      const src = image(m.image) ?? image(m.cover);
      const caption = str(m, "caption") ?? own;
      return {
        ...base(piece, collection),
        title: caption ?? piece.title,
        description: caption ?? "",
        thumbnail: src,
        metadata: {
          caption,
          alt: str(m, "alt") ?? (assets.find((asset) => src?.includes(`/${asset.id}/`))?.alt || undefined),
          aspect: str(m, "aspect") ?? aspectOf(src, assets),
          takenAt: str(m, "takenAt"),
          location: str(m, "location"),
        },
        date: str(m, "takenAt"),
      };
    }
  }
}

function time(value: string | undefined): number {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Pieces for one site collection, in the order the site lists them.
 * Archived pieces are left out: this site has no unlisted-but-reachable pages yet.
 * Once a collection has been reordered in Mantel, that order wins; otherwise `compare`, when given,
 * keeps the order the site already uses.
 */
export function piecesFor(
  content: MantelContent,
  collection: SiteCollection,
  compare?: (a: CMSPost, b: CMSPost) => number,
): CMSPost[] {
  const sources = SOURCES[collection];
  const assets = content.assets ?? [];
  const slugs = new Map<string, string>();
  for (const piece of content.items) {
    const id = piece.metadata?.sanityId;
    if (typeof id === "string") slugs.set(id.replace(/^drafts\./, ""), piece.slug);
  }
  // The preview feed can hold a draft that shares a slug with a published piece (a copy kept back
  // during import). One page per slug: the published piece wins, then whichever came first.
  const bySlug = new Map<string, MantelPiece>();
  for (const piece of content.items) {
    if (!sources.includes(piece.collection) || piece.archived) continue;
    const held = bySlug.get(piece.slug);
    if (!held || (held.status === "draft" && piece.status === "published")) bySlug.set(piece.slug, piece);
  }
  const pieces = [...bySlug.values()];
  const reordered = pieces.some((piece) => (piece.sortOrder ?? 0) !== 0);
  const posts = pieces.map((piece) => ({ piece, post: toPost(piece, collection, assets, slugs) }));
  posts.sort((a, b) => {
    if (reordered) return (a.piece.sortOrder ?? 0) - (b.piece.sortOrder ?? 0);
    if (compare) return compare(a.post, b.post);
    const am = a.post.metadata as Meta;
    const bm = b.post.metadata as Meta;
    if (collection === "work") return (num(bm, "order") ?? 0) - (num(am, "order") ?? 0);
    if (collection === "ideas") return (num(am, "order") ?? 0) - (num(bm, "order") ?? 0);
    if (collection === "blog" || collection === "photos") return time(b.post.date) - time(a.post.date);
    return 0;
  });
  return posts.map((entry) => entry.post);
}
