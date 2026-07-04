import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";
import { fetchFilmMeta, tmdbConfigured } from "./tmdb";
import { fetchSanity } from "./sanity";

export interface FilmMetadata {
  year: number;
  director?: string;
  rating?: number;
  /** ISO date string */
  watchedAt?: string;
  poster?: string;
  review?: string;
  favoriteMoment?: string;
  recommendedFor?: string;
  lists?: string[];
}

export type Film = CMSPost<FilmMetadata>;

export async function getFilms(): Promise<Film[]> {
  const sanity = await fetchSanity<FilmMetadata>("film");
  if (sanity.length > 0) return enrichFilms(sanity);
  const remote = await getPostsByCollection<FilmMetadata>("films");
  const base = remote.length > 0 ? remote : await readLocalFilms();
  return enrichFilms(base);
}

/** Fill missing poster / director / year from TMDB. Frontmatter always wins. */
async function enrichFilms(films: Film[]): Promise<Film[]> {
  if (!tmdbConfigured()) return films;
  return Promise.all(
    films.map(async (film) => {
      const m = film.metadata;
      if (m.poster && m.director && m.year) return film;
      const meta = await fetchFilmMeta(film.title, m.year);
      if (!meta) return film;
      const poster = m.poster ?? meta.poster;
      return {
        ...film,
        thumbnail: film.thumbnail ?? poster,
        metadata: {
          ...m,
          poster,
          director: m.director ?? meta.director,
          year: m.year ?? meta.year ?? m.year,
        },
      } satisfies Film;
    })
  );
}

export async function getFilmBySlug(slug: string): Promise<Film | undefined> {
  const films = await getFilms();
  return films.find((f) => f.slug === slug);
}

async function readLocalFilms(): Promise<Film[]> {
  const entries = await getCollection("films");
  return entries.map((entry) => {
    const d = entry.data;
    return {
      title: d.title,
      slug: entry.id,
      markdownContent: entry.body ?? "",
      description: d.review ?? `${d.title} (${d.year})`,
      thumbnail: d.poster,
      collection: "films",
      metadata: {
        year: d.year,
        director: d.director,
        rating: d.rating,
        watchedAt: d.watchedAt?.toISOString(),
        poster: d.poster,
        review: d.review,
        favoriteMoment: d.favoriteMoment,
        recommendedFor: d.recommendedFor,
        lists: d.lists,
      },
      date: d.watchedAt?.toISOString(),
    } satisfies Film;
  });
}
