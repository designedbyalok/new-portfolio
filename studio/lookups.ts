// Browser-side metadata lookups used by the Studio autofill inputs.
// Books: Open Library (keyless, public). Films: TMDB (needs a read-only key
// exposed as SANITY_STUDIO_TMDB_API_KEY — safe to ship in the Studio bundle).
//
// These fill the TEXT fields (title, author / director, year). The cover and
// poster IMAGES are filled automatically at build time by the site's existing
// Open Library / TMDB enrichment, so we deliberately don't upload images here
// (avoids browser CORS entirely).

export type BookResult = {
  title: string;
  author?: string;
  year?: number;
  coverUrl?: string;
};

export async function searchBooks(query: string): Promise<BookResult[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("title", query);
  url.searchParams.set("limit", "7");
  url.searchParams.set("fields", "title,author_name,first_publish_year,cover_i");
  try {
    const res = await fetch(url.toString(), { headers: { accept: "application/json" } });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json?.docs ?? []).map((d: any) => ({
      title: d.title,
      author: d.author_name?.[0],
      year: d.first_publish_year,
      coverUrl: d.cover_i
        ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
        : undefined,
    }));
  } catch {
    return [];
  }
}

export type FilmResult = {
  id: number;
  title: string;
  year?: number;
  posterUrl?: string;
};

// Sanity/Vite only inline env vars accessed by LITERAL name — dynamic bracket
// access (env[name]) can come back undefined in the built bundle. So read the
// exact key statically from both possible sources.
const RAW_KEY: string | undefined =
  (import.meta as any)?.env?.SANITY_STUDIO_TMDB_API_KEY ||
  (typeof process !== "undefined"
    ? (process as any)?.env?.SANITY_STUDIO_TMDB_API_KEY
    : undefined);
// Treat the example placeholder ("<your …>") and blanks as "not set".
const TMDB_KEY =
  RAW_KEY && !RAW_KEY.includes("<") && RAW_KEY.trim().length > 0
    ? RAW_KEY.trim()
    : undefined;

export const tmdbReady = Boolean(TMDB_KEY);

// TMDB now issues v4 "Read Access Tokens" (JWTs starting with eyJ) as well as
// v3 API keys. Send whichever style the key matches.
function tmdbInit(): RequestInit {
  return TMDB_KEY && TMDB_KEY.startsWith("eyJ")
    ? { headers: { accept: "application/json", Authorization: `Bearer ${TMDB_KEY}` } }
    : { headers: { accept: "application/json" } };
}
function tmdbUrl(path: string, params: Record<string, string>): string {
  const url = new URL("https://api.themoviedb.org/3" + path);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  if (TMDB_KEY && !TMDB_KEY.startsWith("eyJ")) url.searchParams.set("api_key", TMDB_KEY);
  return url.toString();
}

/** Throws on a failed request so the UI can surface the reason (e.g. bad key). */
export async function searchFilms(query: string): Promise<FilmResult[]> {
  if (!TMDB_KEY) throw new Error("No TMDB key set");
  const res = await fetch(
    tmdbUrl("/search/movie", { query, include_adult: "false" }),
    tmdbInit(),
  );
  if (res.status === 401)
    throw new Error("TMDB rejected the key (401) — check SANITY_STUDIO_TMDB_API_KEY");
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  const json: any = await res.json();
  return (json?.results ?? []).slice(0, 7).map((r: any) => ({
    id: r.id,
    title: r.title,
    year: r.release_date ? Number(String(r.release_date).slice(0, 4)) || undefined : undefined,
    posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : undefined,
  }));
}

/** Second call — director only fetched once the user picks a film. */
export async function fetchDirector(id: number): Promise<string | undefined> {
  if (!TMDB_KEY) return undefined;
  try {
    const res = await fetch(tmdbUrl(`/movie/${id}/credits`, {}), tmdbInit());
    if (!res.ok) return undefined;
    const json: any = await res.json();
    return json?.crew?.find((c: any) => c?.job === "Director")?.name;
  } catch {
    return undefined;
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
