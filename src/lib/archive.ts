import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";
import { fetchSanity } from "./sanity";

export type ArchiveType =
  | "note"
  | "quote"
  | "mental-model"
  | "framework"
  | "observation";

export interface ArchiveMetadata {
  type: ArchiveType;
  /** ISO date string */
  date?: string;
  source?: string;
  tags?: string[];
}

export type ArchiveEntry = CMSPost<ArchiveMetadata>;

export async function getArchive(): Promise<ArchiveEntry[]> {
  const sanity = await fetchSanity<ArchiveMetadata>("archiveEntry");
  if (sanity.length > 0) return sanity;
  const remote = await getPostsByCollection<ArchiveMetadata>("archive");
  if (remote.length > 0) return remote;
  return readLocalArchive();
}

export async function getArchiveEntry(
  slug: string,
): Promise<ArchiveEntry | undefined> {
  const items = await getArchive();
  return items.find((e) => e.slug === slug);
}

async function readLocalArchive(): Promise<ArchiveEntry[]> {
  const entries = await getCollection("archive");
  return entries.map((entry) => {
    const d = entry.data;
    return {
      title: d.title,
      slug: entry.id,
      markdownContent: entry.body ?? "",
      description: d.title,
      thumbnail: undefined,
      collection: "archive",
      metadata: {
        type: d.type,
        date: d.date?.toISOString(),
        source: d.source,
        tags: d.tags,
      },
      date: d.date?.toISOString(),
    } satisfies ArchiveEntry;
  });
}
