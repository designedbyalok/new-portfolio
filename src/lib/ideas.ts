import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";

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

export async function getIdeas(): Promise<Idea[]> {
  const remote = await getPostsByCollection<IdeaMetadata>("ideas");
  const list = remote.length > 0 ? remote : await readLocalIdeas();
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
