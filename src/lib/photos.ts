import { type CMSPost } from "./cms";
import { fetchMantel } from "./mantel";
import { fetchSanity } from "./sanity";

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
  { src: "/images/photos/pune.webp", aspect: "3 / 2", caption: "Pune morning", alt: "Abstract warm-tone placeholder for a Pune morning photograph" },
  { src: "/images/photos/goa.webp", aspect: "4 / 5", caption: "Goa", alt: "Abstract sandy-tone placeholder for a Goa photograph" },
  { src: "/images/photos/kerala.webp", aspect: "1 / 1", caption: "Backwaters, Kerala", alt: "Abstract green-tone placeholder for a Kerala backwaters photograph" },
  { src: "/images/photos/street.webp", aspect: "1 / 1", caption: "Streetlight study", alt: "Abstract dark-tone placeholder for a streetlight photograph" },
  { src: "/images/photos/mumbai.webp", aspect: "3 / 2", caption: "Window, Mumbai", alt: "Abstract window-frame placeholder for a Mumbai photograph" },
  { src: "/images/photos/delhi.webp", aspect: "4 / 5", caption: "Old Delhi", alt: "Abstract terracotta-tone placeholder for an Old Delhi photograph" },
];

/**
 * Returns the photo gallery from Sanity.
 * Falls back to placeholders so the about page never breaks when empty.
 */
export async function getPhotos(): Promise<Photo[]> {
  const remote = (await fetchMantel<PhotoMetadata>("photos")) ?? (await fetchSanity<PhotoMetadata>("photo"));
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
