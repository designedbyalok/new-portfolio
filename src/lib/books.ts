import { getCollection } from "astro:content";
import { type CMSPost } from "./cms";
import { fetchBookMeta } from "./openlibrary";
import { fetchSanity } from "./sanity";

/** Per-book metadata. Mirrors the MDX frontmatter. */
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
 * Returns the bookshelf from Sanity, falling back to local MDX content so the
 * page keeps working if Sanity is empty or unreachable.
 */
export async function getBooks(): Promise<Book[]> {
  const sanity = await fetchSanity<BookMetadata>("book");
  const base = sanity.length > 0 ? sanity : await readLocalBooks();
  return enrichBooks(base);
}

/** Fill a missing cover from Open Library (keyless). Frontmatter always wins. */
async function enrichBooks(books: Book[]): Promise<Book[]> {
  return Promise.all(
    books.map(async (book) => {
      if (book.metadata.cover) return book;
      const meta = await fetchBookMeta(book.title, book.metadata.author);
      if (!meta?.cover) return book;
      return {
        ...book,
        thumbnail: book.thumbnail ?? meta.cover,
        metadata: { ...book.metadata, cover: meta.cover },
      } satisfies Book;
    })
  );
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((book) => book.slug === slug);
}

/** Fallback: reads the local MDX collection and shapes it like a CMS post. */
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
