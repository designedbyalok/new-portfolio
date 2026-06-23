// Build-time book-cover lookup via Open Library — a fully public, keyless API
// (https://openlibrary.org/developers/api). Never throws: on any failure it
// resolves to null and the book falls back to its designed spine cover.

const SEARCH = "https://openlibrary.org/search.json";
const COVER = "https://covers.openlibrary.org/b/id";

export type BookMeta = {
  cover?: string;
};

// Cache per (title|author) so repeated page builds hit the API once.
const cache = new Map<string, BookMeta | null>();

export async function fetchBookMeta(title: string, author?: string): Promise<BookMeta | null> {
  const cacheKey = `${title.toLowerCase()}|${(author ?? "").toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  let meta: BookMeta | null = null;
  try {
    const url = new URL(SEARCH);
    url.searchParams.set("title", title);
    if (author) url.searchParams.set("author", author);
    url.searchParams.set("limit", "1");
    url.searchParams.set("fields", "cover_i,title,author_name");

    const res = await fetch(url.toString(), { headers: { accept: "application/json" } });
    if (res.ok) {
      const json: any = await res.json();
      const coverId = json?.docs?.[0]?.cover_i;
      if (coverId) meta = { cover: `${COVER}/${coverId}-L.jpg` };
    }
  } catch {
    meta = null;
  }

  cache.set(cacheKey, meta);
  return meta;
}
