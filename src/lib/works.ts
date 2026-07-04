import { getCollection } from "astro:content";
import { getPostsByCollection, type CMSPost } from "./cms";
import { fetchSanity } from "./sanity";

export interface WorkPhoto {
  src: string;
  caption?: string;
  aspect?: string;
}

export interface WorkProjectItem {
  title: string;
  description: string;
  href?: string;
}

export interface WorkTestimonial {
  quote: string;
  author: string;
  role?: string;
}

export interface WorkMetadata {
  company: string;
  role: string;
  period: string;
  summary: string;
  website?: string;
  order?: number;
  hero?: string;
  logo?: string;
  photos?: WorkPhoto[];
  projects?: WorkProjectItem[];
  testimonial?: WorkTestimonial;
}

export type Work = CMSPost<WorkMetadata>;

export async function getWorks(): Promise<Work[]> {
  const sanity = await fetchSanity<WorkMetadata>("work");
  if (sanity.length > 0) return sanity;
  const remote = await getPostsByCollection<WorkMetadata>("work");
  const list = remote.length > 0 ? remote : await readLocalWorks();
  return list.sort(
    (a, b) => (b.metadata.order ?? 0) - (a.metadata.order ?? 0),
  );
}

export async function getWorkBySlug(slug: string): Promise<Work | undefined> {
  const all = await getWorks();
  return all.find((w) => w.slug === slug);
}

async function readLocalWorks(): Promise<Work[]> {
  const entries = await getCollection("work");
  return entries.map((entry) => {
    const d = entry.data;
    return {
      title: d.company,
      slug: entry.id,
      markdownContent: entry.body ?? "",
      description: d.summary,
      thumbnail: d.hero,
      collection: "work",
      metadata: {
        company: d.company,
        role: d.role,
        period: d.period,
        summary: d.summary,
        website: d.website,
        order: d.order,
        hero: d.hero,
        logo: d.logo,
        photos: d.photos,
        projects: d.projects,
        testimonial: d.testimonial,
      },
    } satisfies Work;
  });
}
