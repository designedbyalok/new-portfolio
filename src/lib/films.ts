import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";

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
  const remote = await getPostsByCollection<FilmMetadata>("films");
  if (remote.length > 0) return remote;
  return readLocalFilms();
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
