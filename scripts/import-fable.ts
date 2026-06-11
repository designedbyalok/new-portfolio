/**
 * Import books from a Fable account into src/content/books/.
 *
 * Usage:
 *   FABLE_USERNAME=yourname bun scripts/import-fable.ts
 *
 * IMPORTANT: Fable has NO official public API. This script talks to an
 * unofficial endpoint (api.fable.co) that was observed from the web app —
 * it can change or disappear at any time WITHOUT warning. Treat every run
 * as best-effort. Builds NEVER depend on this script: it is strictly a
 * manual, optional convenience, and every failure path exits 0.
 *
 * Notes:
 * - Generates one markdown file per book, slugged from the title.
 * - Skips slugs that already exist (manual edits are never overwritten).
 * - List names map to statuses: "want to read" → wishlist,
 *   "reading"/"currently…" → currently-reading, "finished"/"read" → finished,
 *   anything else → finished.
 * - spineColor is picked from a fixed muted palette by title hash;
 *   textColor is chosen for contrast against it.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BOOKS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "content",
  "books",
);

const API_BASE = "https://api.fable.co/api/v2";
const USER_AGENT =
  "designedbyalok.com fable importer (manual, low-volume; contact via site)";

/** Fixed muted palette — dark, bookish tones that read well on the shelf. */
const SPINE_PALETTE = [
  "#5A2A2A", // oxblood
  "#33523E", // forest
  "#2F4156", // slate blue
  "#6B4A2F", // umber
  "#4A3F5C", // plum
  "#3E5752", // pine teal
  "#705236", // tobacco
  "#41414B", // ink grey
] as const;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Deterministic title hash → palette index. */
function titleHash(title: string): number {
  let h = 5381;
  for (let i = 0; i < title.length; i++) {
    h = (h * 33) ^ title.charCodeAt(i);
  }
  return Math.abs(h) % SPINE_PALETTE.length;
}

/** Pick a readable text color for a hex background (relative luminance). */
function textColorFor(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.45 ? "#1E1E1E" : "#F4F1EA";
}

type BookStatus = "currently-reading" | "finished" | "wishlist";

function statusForListName(name: string): BookStatus {
  const n = name.toLowerCase().replace(/[_-]+/g, " ").trim();
  if (n.includes("want to read") || n === "want") return "wishlist";
  if (n.includes("reading") || n.includes("currently"))
    return "currently-reading";
  if (n.includes("finished") || n === "read") return "finished";
  return "finished";
}

/** Serialize a frontmatter value safely (JSON strings are valid YAML scalars). */
function yamlString(s: string): string {
  return JSON.stringify(s);
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** The unofficial API wraps collections inconsistently — accept both shapes. */
function asArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["results", "items", "data", "lists", "books"]) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function extractAuthor(book: Record<string, unknown>): string {
  const authors = book.authors;
  if (Array.isArray(authors) && authors.length > 0) {
    const names = authors
      .map((a) =>
        typeof a === "string"
          ? a
          : str((a as Record<string, unknown>)?.name) ?? "",
      )
      .filter(Boolean);
    if (names.length > 0) return names.join(", ");
  }
  return str(book.author) ?? "Unknown";
}

function extractBook(
  entry: Record<string, unknown>,
): { title: string; author: string; cover?: string } | undefined {
  // Entries are sometimes the book itself, sometimes wrapped in { book: … }.
  const book =
    entry.book && typeof entry.book === "object"
      ? (entry.book as Record<string, unknown>)
      : entry;
  const title = str(book.title);
  if (!title) return undefined;
  return {
    title,
    author: extractAuthor(book),
    cover: str(book.cover_image) ?? str(book.image_url) ?? str(book.cover),
  };
}

async function main(): Promise<void> {
  const username = process.env.FABLE_USERNAME;
  if (!username) {
    console.log(
      "FABLE_USERNAME is not set — skipping Fable import. " +
        "Run with: FABLE_USERNAME=yourname bun scripts/import-fable.ts",
    );
    return;
  }

  const user = encodeURIComponent(username);
  console.log(`Fetching ${API_BASE}/users/${user}/lists …`);
  const lists = asArray(await fetchJson(`${API_BASE}/users/${user}/lists`));
  if (lists.length === 0) {
    console.log("No lists found (or unexpected response shape) — nothing imported.");
    return;
  }

  mkdirSync(BOOKS_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;

  for (const list of lists) {
    const listId = str(list.id) ?? (typeof list.id === "number" ? String(list.id) : undefined);
    const listName = str(list.name) ?? str(list.title) ?? "";
    if (!listId) continue;

    const status = statusForListName(listName);
    console.log(`List "${listName || listId}" → status "${status}"`);

    let entries: Record<string, unknown>[];
    try {
      entries = asArray(
        await fetchJson(
          `${API_BASE}/users/${user}/lists/${encodeURIComponent(listId)}/books`,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  Could not fetch books for this list (${message}) — skipping it.`);
      continue;
    }

    for (const entry of entries) {
      const book = extractBook(entry);
      if (!book) continue;

      const slug = slugify(book.title);
      if (!slug) continue;

      const filePath = join(BOOKS_DIR, `${slug}.md`);
      if (existsSync(filePath)) {
        skipped++;
        continue;
      }

      const spineColor = SPINE_PALETTE[titleHash(book.title)];
      const textColor = textColorFor(spineColor);

      const fm: string[] = ["---"];
      fm.push(`title: ${yamlString(book.title)}`);
      fm.push(`author: ${yamlString(book.author)}`);
      fm.push(`status: "${status}"`);
      fm.push(`spineColor: "${spineColor}"`);
      fm.push(`textColor: "${textColor}"`);
      if (book.cover) fm.push(`cover: ${yamlString(book.cover)}`);
      fm.push("---");

      const body = "\n<!-- Imported from Fable — add your own notes -->\n";
      writeFileSync(filePath, `${fm.join("\n")}${body}`, "utf8");
      written++;
      console.log(`  + ${slug}.md`);
    }
  }

  console.log(
    `Done. ${written} written, ${skipped} skipped (already existed).`,
  );
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.log(
    `Fable import failed: ${message} — nothing imported. ` +
      "(The endpoint is unofficial and may have changed; the site build is unaffected.)",
  );
  process.exit(0);
});
