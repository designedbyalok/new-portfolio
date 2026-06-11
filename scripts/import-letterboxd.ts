/**
 * Import watched films from a public Letterboxd RSS feed into src/content/films/.
 *
 * Usage:
 *   LETTERBOXD_USERNAME=yourname bun scripts/import-letterboxd.ts
 *
 * Notes:
 * - Generates one markdown file per film, slugged "{title}-{year}".
 * - Skips slugs that already exist (manual edits are never overwritten).
 * - Curated lists stay manual: imported films get `lists: []`.
 * - Never fails the build: every error path prints a message and exits 0.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const FILMS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "content",
  "films",
);

const REVIEW_MAX_CHARS = 600;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    );
}

function stripCdata(s: string): string {
  const m = s.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return m ? m[1] : s;
}

/** Extract the text content of the first <tag>…</tag> in a block. */
function tagText(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  const raw = stripCdata(m[1]).trim();
  return raw === "" ? undefined : decodeEntities(raw);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Poster = first <img src="…"> inside the description html. */
function extractPoster(descriptionHtml: string): string | undefined {
  const m = descriptionHtml.match(/<img[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
  return m ? decodeEntities(m[1]) : undefined;
}

/** Review = description text after dropping the poster img and all html. */
function extractReview(descriptionHtml: string): string | undefined {
  const text = decodeEntities(
    descriptionHtml
      .replace(/<img[^>]*>/gi, " ")
      .replace(/<\/p>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim()
    .replace(/\n+/g, " ");
  if (!text) return undefined;
  // Letterboxd appends a boilerplate line for entries watched-without-review.
  if (/^Watched on /i.test(text)) return undefined;
  if (text.length <= REVIEW_MAX_CHARS) return text;
  return `${text.slice(0, REVIEW_MAX_CHARS).replace(/\s+\S*$/, "")}…`;
}

/** Serialize a frontmatter value safely (JSON strings are valid YAML scalars). */
function yamlString(s: string): string {
  return JSON.stringify(s);
}

async function main(): Promise<void> {
  const username = process.env.LETTERBOXD_USERNAME;
  if (!username) {
    console.log(
      "LETTERBOXD_USERNAME is not set — skipping Letterboxd import. " +
        "Run with: LETTERBOXD_USERNAME=yourname bun scripts/import-letterboxd.ts",
    );
    return;
  }

  const feedUrl = `https://letterboxd.com/${encodeURIComponent(username)}/rss/`;
  console.log(`Fetching ${feedUrl} …`);

  const res = await fetch(feedUrl, {
    headers: { "user-agent": "designedbyalok.com letterboxd importer" },
  });
  if (!res.ok) {
    console.log(`Letterboxd responded ${res.status} ${res.statusText} — nothing imported.`);
    return;
  }
  const xml = await res.text();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  if (items.length === 0) {
    console.log("No items found in the RSS feed — nothing imported.");
    return;
  }

  mkdirSync(FILMS_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const filmTitle = tagText(item, "letterboxd:filmTitle");
    const filmYearRaw = tagText(item, "letterboxd:filmYear");
    const year = filmYearRaw ? Number.parseInt(filmYearRaw, 10) : NaN;

    // Skip non-film items (e.g. list updates) and anything malformed.
    if (!filmTitle || !Number.isFinite(year)) continue;

    const slug = `${slugify(filmTitle)}-${year}`;
    if (!slug || slug === `-${year}`) continue;

    const filePath = join(FILMS_DIR, `${slug}.md`);
    if (existsSync(filePath)) {
      skipped++;
      continue;
    }

    const ratingRaw = tagText(item, "letterboxd:memberRating");
    const rating = ratingRaw ? Number.parseFloat(ratingRaw) : NaN;
    const watchedDate = tagText(item, "letterboxd:watchedDate");
    const link = tagText(item, "link");

    const descriptionHtml = (() => {
      const m = item.match(/<description(?:\s[^>]*)?>([\s\S]*?)<\/description>/i);
      return m ? stripCdata(m[1]) : "";
    })();

    const poster = extractPoster(descriptionHtml);
    const review = extractReview(descriptionHtml);

    const fm: string[] = ["---"];
    fm.push(`title: ${yamlString(filmTitle)}`);
    fm.push(`year: ${year}`);
    if (Number.isFinite(rating) && rating >= 0 && rating <= 5) {
      fm.push(`rating: ${rating}`);
    }
    if (watchedDate && /^\d{4}-\d{2}-\d{2}$/.test(watchedDate)) {
      fm.push(`watchedAt: ${watchedDate}`);
    }
    if (poster) fm.push(`poster: ${yamlString(poster)}`);
    if (review) fm.push(`review: ${yamlString(review)}`);
    fm.push("lists: []");
    fm.push("---");

    const body = link ? `\n[Logged on Letterboxd](${link})\n` : "";
    writeFileSync(filePath, `${fm.join("\n")}\n${body}`, "utf8");
    created++;
    console.log(`  + ${slug}.md`);
  }

  console.log(
    `Done. Created ${created} film${created === 1 ? "" : "s"}, skipped ${skipped} existing.`,
  );
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.log(`Letterboxd import failed: ${message} — nothing imported.`);
  process.exit(0);
});
