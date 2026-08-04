import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";
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
 * Merge by slug. `overlay` wins on conflicts; `base` fills slugs that
 * overlay doesn't have — so local markdown can ship new case studies while
 * Sanity/WriterPro still only hold the older set.
 */
function mergeBySlug(base: Idea[], overlay: Idea[]): Idea[] {
  const map = new Map<string, Idea>();
  for (const item of base) map.set(item.slug, item);
  for (const item of overlay) map.set(item.slug, item);
  return [...map.values()];
}

export async function getIdeas(): Promise<Idea[]> {
  // Local markdown is always the floor. Without this, a non-empty but stale
  // WriterPro "ideas" collection (or a partial Sanity dataset) hides every
  // case study that only exists in src/content/projects/.
  const local = await readLocalIdeas();
  const sanity = await fetchSanity<IdeaMetadata>("idea");
  if (sanity.length > 0) {
    return mergeBySlug(local, sanity).sort(
      (a, b) => (a.metadata.order ?? 0) - (b.metadata.order ?? 0),
    );
  }
  const remote = await getPostsByCollection<IdeaMetadata>("ideas");
  // Prefer local over WriterPro when both exist: the repo is where new case
  // studies are authored; WriterPro may lag. CMS still fills empty local sets.
  const list =
    local.length > 0
      ? remote.length > 0
        ? mergeBySlug(remote, local)
        : local
      : remote;
  return list.sort(
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
