import { getPostsByCollection, type CMSPost } from "./cms";

export interface PhotoMetadata {
  caption?: string;
  alt?: string;
  /** CSS aspect-ratio string, e.g. "3 / 2", "4 / 5", "1 / 1". */
  aspect?: string;
  /** ISO date string */
  takenAt?: string;
  location?: string;
}

export type PhotoPost = CMSPost<PhotoMetadata>;

/** Flat shape consumed by BentoGallery. */
export interface Photo {
  src: string;
  aspect: string;
  caption: string;
  alt?: string;
}

const DEFAULT_PLACEHOLDERS: Photo[] = [
  { src: "https://picsum.photos/seed/photo-pune/1200/800", aspect: "3 / 2", caption: "Pune morning" },
  { src: "https://picsum.photos/seed/photo-goa/900/1100", aspect: "4 / 5", caption: "Goa" },
  { src: "https://picsum.photos/seed/photo-kerala/1000/1000", aspect: "1 / 1", caption: "Backwaters, Kerala" },
  { src: "https://picsum.photos/seed/photo-street/1000/1000", aspect: "1 / 1", caption: "Streetlight study" },
  { src: "https://picsum.photos/seed/photo-mumbai/1200/800", aspect: "3 / 2", caption: "Window, Mumbai" },
  { src: "https://picsum.photos/seed/photo-delhi/900/1100", aspect: "4 / 5", caption: "Old Delhi" },
];

/**
 * Returns the photo gallery from WriterPro's "photos" collection.
 * Falls back to placeholders during the migration so the about page never breaks.
 */
export async function getPhotos(): Promise<Photo[]> {
  const remote = await getPostsByCollection<PhotoMetadata>("photos");
  if (remote.length === 0) return DEFAULT_PLACEHOLDERS;
  return remote
    .filter((p) => Boolean(p.thumbnail))
    .map((p) => ({
      src: p.thumbnail!,
      aspect: p.metadata.aspect ?? "3 / 2",
      caption: p.metadata.caption ?? p.title,
      alt: p.metadata.alt ?? p.metadata.caption ?? p.title,
    }));
}
