import type { CMSPost } from "./cms";
import { piecesFor, type MantelContent, type SiteCollection } from "./mantel-map";

// Mantel is the content source when MANTEL_CONTENT_URL is set. Mantel writes these
// variables onto the hosting project when the site is connected.
const CONTENT_URL = import.meta.env.MANTEL_CONTENT_URL;
// The snapshot a deploy was triggered for, so one build never mixes two publishes.
const REVISION = import.meta.env.MANTEL_REVISION;
const PREVIEW_SECRET = import.meta.env.MANTEL_PREVIEW_SECRET;
// Drafts instead of the published snapshot. For local previews only; never deploy this build.
const PREVIEW = ["1", "true"].includes(String(import.meta.env.MANTEL_PREVIEW ?? ""));

let pending: Promise<MantelContent | null> | null = null;
let loadedAt = 0;

function load(): Promise<MantelContent | null> {
  if (!CONTENT_URL) return Promise.resolve(null);
  // A build reads once. The dev server re-reads after a moment, so a publish shows on refresh.
  if (import.meta.env.DEV && Date.now() - loadedAt > 2000) pending = null;
  if (!pending) loadedAt = Date.now();
  pending ??= (async () => {
    try {
      const url = new URL(PREVIEW ? CONTENT_URL.replace(/\/content\/?$/, "/preview") : CONTENT_URL);
      if (!PREVIEW && REVISION) url.searchParams.set("revision", REVISION);
      const headers: Record<string, string> = PREVIEW && PREVIEW_SECRET ? { authorization: `Bearer ${PREVIEW_SECRET}` } : {};
      const response = await fetch(url, { headers, cache: "no-store" });
      if (!response.ok) throw new Error(`responded ${response.status} ${response.statusText}`);
      const content = (await response.json()) as MantelContent;
      if (PREVIEW) console.warn("[mantel] Building from drafts (MANTEL_PREVIEW). Do not deploy this build.");
      return content;
    } catch (err) {
      console.warn(`[mantel] Content unavailable, using the previous sources: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  })();
  return pending;
}

/**
 * One collection from Mantel, shaped as CMSPost[].
 *
 * Returns null when Mantel isn't configured or can't be reached, so callers fall
 * back to Sanity, WriterPro, or local files. An empty array is a real answer:
 * Mantel is the source and has nothing published there, so callers must not fall
 * back, or unpublished pieces would come back from the old source.
 */
export async function fetchMantel<M = Record<string, unknown>>(
  collection: SiteCollection,
  options: { compare?: (a: CMSPost<M>, b: CMSPost<M>) => number } = {},
): Promise<CMSPost<M>[] | null> {
  const content = await load();
  const compare = options.compare as ((a: CMSPost, b: CMSPost) => number) | undefined;
  return content ? (piecesFor(content, collection, compare) as CMSPost<M>[]) : null;
}
