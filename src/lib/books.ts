import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";

/** Per-book metadata stored on the WriterPro post. Mirrors the old MDX frontmatter. */
export interface BookMetadata {
  author: string;
  status: "currently-reading" | "finished" | "paused" | "abandoned" | "wishlist";
  rating?: number;
  /** ISO date string */
  startedAt?: string;
  /** ISO date string */
  finishedAt?: string;
  spineColor?: string;
  textColor?: string;
  cover?: string;
  review?: string;
  favoriteQuote?: string;
  whyItMatters?: string;
}

export type Book = CMSPost<BookMetadata>;

/**
 * Returns the bookshelf from WriterPro's "books" collection.
 * Falls back to local MDX content if WriterPro has no books yet,
 * so the page keeps working during the migration.
 */
export async function getBooks(): Promise<Book[]> {
  const remote = await getPostsByCollection<BookMetadata>("books");
  if (remote.length > 0) return remote;
  return readLocalBooks();
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((book) => book.slug === slug);
}

/** Fallback: reads the legacy MDX collection and shapes it like a WriterPro post. */
async function readLocalBooks(): Promise<Book[]> {
  const entries = await getCollection("books");
  return entries.map((entry) => {
    const d = entry.data;
    return {
      title: d.title,
      slug: entry.id,
      markdownContent: entry.body ?? "",
      description: d.review ?? `${d.title} by ${d.author}`,
      thumbnail: d.cover,
      collection: "books",
      metadata: {
        author: d.author,
        status: d.status,
        rating: d.rating,
        startedAt: d.startedAt?.toISOString(),
        finishedAt: d.finishedAt?.toISOString(),
        spineColor: d.spineColor,
        textColor: d.textColor,
        cover: d.cover,
        review: d.review,
        favoriteQuote: d.favoriteQuote,
        whyItMatters: d.whyItMatters,
      },
      date: d.finishedAt?.toISOString() ?? d.startedAt?.toISOString(),
    } satisfies Book;
  });
}
