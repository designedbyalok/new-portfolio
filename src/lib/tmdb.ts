// Build-time TMDB lookup for film metadata (poster / director / year / synopsis).
// Public API — https://developer.themoviedb.org. Needs a free key in the env as
// TMDB_API_KEY (v3) or TMDB_READ_TOKEN (v4 bearer). Never throws: with no key or
// on any failure it resolves to null and the film keeps its own frontmatter.

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

export type TmdbFilmMeta = {
  poster?: string;
  director?: string;
  year?: number;
  overview?: string;
};

export function tmdbConfigured(): boolean {
  return Boolean(import.meta.env.TMDB_API_KEY || import.meta.env.TMDB_READ_TOKEN);
}

async function tmdb(path: string, params: Record<string, string> = {}): Promise<any | null> {
  const key = import.meta.env.TMDB_API_KEY as string | undefined;
  const token = import.meta.env.TMDB_READ_TOKEN as string | undefined;
  if (!key && !token) return null;

  const url = new URL(TMDB_BASE + path);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  if (key) url.searchParams.set("api_key", key);

  try {
    const res = await fetch(url.toString(), {
      headers: token
        ? { Authorization: `Bearer ${token}`, accept: "application/json" }
        : { accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Cache per (title|year) so repeated getStaticPaths/page builds hit the API once.
const cache = new Map<string, TmdbFilmMeta | null>();

export async function fetchFilmMeta(title: string, year?: number): Promise<TmdbFilmMeta | null> {
  const cacheKey = `${title.toLowerCase()}|${year ?? ""}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  let meta: TmdbFilmMeta | null = null;
  const search = await tmdb("/search/movie", {
    query: title,
    year: year ? String(year) : "",
    include_adult: "false",
  });
  const hit = search?.results?.[0];
  if (hit) {
    let director: string | undefined;
    const credits = await tmdb(`/movie/${hit.id}/credits`);
    const dir = credits?.crew?.find((c: any) => c?.job === "Director");
    if (dir?.name) director = dir.name;

    meta = {
      poster: hit.poster_path ? TMDB_IMG + hit.poster_path : undefined,
      director,
      year: hit.release_date ? Number(String(hit.release_date).slice(0, 4)) || undefined : undefined,
      overview: hit.overview || undefined,
    };
  }

  cache.set(cacheKey, meta);
  return meta;
}
