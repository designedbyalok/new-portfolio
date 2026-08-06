import { getCollection } from "astro:content";
import { type CMSPost } from "./cms";
import { fetchSanity } from "./sanity";

export interface IdeaPhoto {
  src: string;
  caption?: string;
  aspect?: string;
}

export interface IdeaMetadata {
  tagline: string;
  period: string;
  role?: string;
  tags?: string[];
  hero?: string;
  external?: string;
  order?: number;
  idea: string;
  problem: string;
  solution: string;
  whyUnique: string;
  photos?: IdeaPhoto[];
}

export type Idea = CMSPost<IdeaMetadata>;

/**
 * Merge by slug. `overlay` (Sanity) wins on conflicts; `base` (local) fills
 * slugs Sanity doesn't have — so local markdown can ship a new case study
 * before it's mirrored into Sanity.
 */
function mergeBySlug(base: Idea[], overlay: Idea[]): Idea[] {
  const map = new Map<string, Idea>();
  for (const item of base) map.set(item.slug, item);
  for (const item of overlay) map.set(item.slug, item);
  return [...map.values()];
}

export async function getIdeas(): Promise<Idea[]> {
  const local = await readLocalIdeas();
  const sanity = await fetchSanity<IdeaMetadata>("idea");
  const merged = sanity.length > 0 ? mergeBySlug(local, sanity) : local;
  return merged.sort(
    (a, b) => (a.metadata.order ?? 0) - (b.metadata.order ?? 0),
  );
}

export async function getIdeaBySlug(slug: string): Promise<Idea | undefined> {
  const all = await getIdeas();
  return all.find((i) => i.slug === slug);
}

async function readLocalIdeas(): Promise<Idea[]> {
  const entries = await getCollection("projects");
  return entries.map((entry) => {
    const d = entry.data;
    return {
      title: d.title,
      slug: entry.id,
      markdownContent: entry.body ?? "",
      description: d.tagline,
      thumbnail: d.hero,
      collection: "ideas",
      metadata: {
        tagline: d.tagline,
        period: d.period,
        role: d.role,
        tags: d.tags,
        hero: d.hero,
        external: d.external,
        order: d.order,
        idea: d.idea,
        problem: d.problem,
        solution: d.solution,
        whyUnique: d.whyUnique,
        photos: d.photos,
      },
    } satisfies Idea;
  });
}
