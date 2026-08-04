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
  /** "experience" = employment; "project" = personal product. */
  kind?: "experience" | "project";
  website?: string;
  order?: number;
  hero?: string;
  logo?: string;
  photos?: WorkPhoto[];
  projects?: WorkProjectItem[];
  testimonial?: WorkTestimonial;
}

export type Work = CMSPost<WorkMetadata>;

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Turns a free-text `period` into a sortable timestamp for when the role ended:
 * "Jun 2023 — Present" (ongoing, sorts first), "Aug 2021 — Jun 2023",
 * "May 2026", "2026". A bare year is read as that year's end, since this is an
 * end bound. Returns undefined if it can't be parsed, so the caller can fall
 * back to the manual `order` field.
 */
function periodEnd(period?: string): number | undefined {
  if (!period) return undefined;
  const parts = period.split(/[—–-]/).map((s) => s.trim()).filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (/present|current|now|ongoing/i.test(last)) return Number.MAX_SAFE_INTEGER;
  const m = last.match(/([A-Za-z]{3,})?\s*(\d{4})/);
  if (!m) return undefined;
  const month = m[1] ? (MONTHS[m[1].slice(0, 3).toLowerCase()] ?? 11) : 11;
  return Date.UTC(Number(m[2]), month);
}

/** Newest first by period; `order` (higher first) breaks ties or fills gaps. */
function sortWorks(list: Work[]): Work[] {
  return [...list].sort((a, b) => {
    const ta = periodEnd(a.metadata.period);
    const tb = periodEnd(b.metadata.period);
    if (ta !== undefined && tb !== undefined && ta !== tb) return tb - ta;
    return (b.metadata.order ?? 0) - (a.metadata.order ?? 0);
  });
}

/**
 * Merge by slug. `overlay` wins on conflicts; `base` keeps entries the
 * overlay is missing. When both have the same slug, prefer overlay but
 * backfill `kind` from base so a CMS doc that predates the field still
 * picks up `kind: "project"` from local markdown.
 */
function mergeBySlug(base: Work[], overlay: Work[]): Work[] {
  const map = new Map<string, Work>();
  for (const item of base) map.set(item.slug, item);
  for (const item of overlay) {
    const prev = map.get(item.slug);
    if (prev?.metadata.kind && !item.metadata.kind) {
      map.set(item.slug, {
        ...item,
        metadata: { ...item.metadata, kind: prev.metadata.kind },
      });
    } else {
      map.set(item.slug, item);
    }
  }
  return [...map.values()];
}

async function getAllWorks(): Promise<Work[]> {
  // Local markdown is authoritative for work when present. A non-empty
  // WriterPro "work" collection used to replace it entirely, which dropped
  // `kind: "project"` and left /projects empty while /work still listed
  // WritrPro and JobStax.
  const local = await readLocalWorks();
  const sanity = await fetchSanity<WorkMetadata>("work");
  if (sanity.length > 0) return sortWorks(mergeBySlug(local, sanity));
  if (local.length > 0) return sortWorks(local);
  return sortWorks(await getPostsByCollection<WorkMetadata>("work"));
}

/** Employment history — the Work Experience page. */
export async function getWorks(): Promise<Work[]> {
  return (await getAllWorks()).filter((w) => (w.metadata.kind ?? "experience") !== "project");
}

/** Personal products (WritrPro, JobStax, ...) — the Projects page. */
export async function getSideProjects(): Promise<Work[]> {
  return (await getAllWorks()).filter((w) => w.metadata.kind === "project");
}

export async function getWorkBySlug(slug: string): Promise<Work | undefined> {
  const all = await getAllWorks();
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
        kind: d.kind,
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
