/**
 * One-time content import into Sanity. Reads the local MDX collections and
 * the WriterPro blog, writes documents with deterministic _ids so re-runs
 * update instead of duplicating.
 *
 *   bun run scripts/import-to-sanity.ts
 *
 * Placeholder images (picsum / favicon) are intentionally skipped — real
 * assets get uploaded through the Studio afterwards. Real blog thumbnails
 * are side-loaded into Sanity's asset store.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { parse as parseYaml } from "yaml";
import { createClient } from "@sanity/client";

const env = (k: string) => process.env[k] ?? readEnvFile(k);
let envCache: Record<string, string> | null = null;
function readEnvFile(k: string): string | undefined {
  if (!envCache) {
    envCache = {};
    try {
      const raw = require("node:fs").readFileSync(".env", "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m) envCache[m[1]] = m[2];
      }
    } catch {}
  }
  return envCache[k];
}

const client = createClient({
  projectId: env("SANITY_PROJECT_ID")!,
  dataset: env("SANITY_DATASET") ?? "production",
  token: env("SANITY_TOKEN"),
  apiVersion: "2026-01-01",
  useCdn: false,
});

const isPlaceholder = (url?: string) =>
  !url || url.includes("picsum.photos") || url.endsWith("favicon.svg");

const slugField = (current: string) => ({ _type: "slug", current });

async function readMdx(dir: string) {
  const out: { slug: string; fm: any; body: string }[] = [];
  for (const f of await readdir(join("src/content", dir)).catch(() => [])) {
    if (!/\.(md|mdx)$/.test(f)) continue;
    const raw = await readFile(join("src/content", dir, f), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    out.push({
      slug: basename(f, extname(f)),
      fm: m ? parseYaml(m[1]) : {},
      body: (m ? m[2] : raw).trim(),
    });
  }
  return out;
}

const iso = (v: any) =>
  v ? new Date(v).toISOString().slice(0, 10) : undefined;

const clean = (o: Record<string, any>) => {
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  return o;
};

async function uploadImageFromUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, {
    filename: url.split("/").pop() ?? "image",
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  const docs: any[] = [];

  for (const { slug, fm, body } of await readMdx("books")) {
    docs.push(clean({
      _id: `book.${slug}`, _type: "book", title: fm.title, slug: slugField(slug),
      author: fm.author, status: fm.status, rating: fm.rating,
      startedAt: iso(fm.startedAt), finishedAt: iso(fm.finishedAt),
      spineColor: fm.spineColor, textColor: fm.textColor,
      review: fm.review, favoriteQuote: fm.favoriteQuote,
      whyItMatters: fm.whyItMatters, body,
    }));
  }
  for (const { slug, fm, body } of await readMdx("films")) {
    docs.push(clean({
      _id: `film.${slug}`, _type: "film", title: fm.title, slug: slugField(slug),
      year: fm.year, director: fm.director, rating: fm.rating,
      watchedAt: iso(fm.watchedAt), review: fm.review,
      favoriteMoment: fm.favoriteMoment, recommendedFor: fm.recommendedFor,
      lists: fm.lists ?? [], body,
    }));
  }
  for (const { slug, fm, body } of await readMdx("archive")) {
    docs.push(clean({
      _id: `archiveEntry.${slug}`, _type: "archiveEntry", title: fm.title,
      slug: slugField(slug), type: fm.type, date: iso(fm.date),
      source: fm.source, tags: fm.tags ?? [], body,
    }));
  }
  for (const { slug, fm, body } of await readMdx("work")) {
    docs.push(clean({
      _id: `work.${slug}`, _type: "work", company: fm.company, slug: slugField(slug),
      role: fm.role, period: fm.period, summary: fm.summary, website: fm.website,
      order: fm.order,
      projects: (fm.projects ?? []).map((p: any, i: number) => ({
        _key: `p${i}`, title: p.title, description: p.description,
        ...(p.href && { href: p.href }),
      })),
      ...(fm.testimonial && { testimonial: fm.testimonial }),
      body,
    }));
  }
  for (const { slug, fm, body } of await readMdx("projects")) {
    docs.push(clean({
      _id: `idea.${slug}`, _type: "idea", title: fm.title, slug: slugField(slug),
      tagline: fm.tagline, period: fm.period, role: fm.role, tags: fm.tags ?? [],
      external: fm.external, order: fm.order, idea: fm.idea, problem: fm.problem,
      solution: fm.solution, whyUnique: fm.whyUnique, body,
    }));
  }

  // Blog from WriterPro
  const apiUrl = env("CMS_API_URL") ?? "https://writerpro.vercel.app/api/cms/posts";
  const apiKey = env("CMS_API_KEY");
  if (apiKey) {
    try {
      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (res.ok) {
        for (const p of (await res.json()) as any[]) {
          let thumbnail;
          if (!isPlaceholder(p.thumbnailUrl)) {
            try {
              thumbnail = await uploadImageFromUrl(p.thumbnailUrl);
              console.log(`  uploaded thumbnail for ${p.slug}`);
            } catch (e) {
              console.warn(`  thumbnail failed for ${p.slug}: ${e}`);
            }
          }
          docs.push(clean({
            _id: `post.${p.slug}`, _type: "post", title: p.title,
            slug: slugField(p.slug), seoDescription: p.seoDescription,
            publishedAt: p.publishedAt, body: p.markdownContent, thumbnail,
          }));
        }
      } else console.warn(`WriterPro fetch failed: ${res.status} — skipping blog`);
    } catch (e) {
      console.warn(`WriterPro unreachable — skipping blog: ${e}`);
    }
  }

  // Fall back to local MDX blog posts when WriterPro contributed nothing.
  if (!docs.some((d) => d._type === "post")) {
    console.log("Importing blog from local MDX fallback…");
    for (const { slug, fm, body } of await readMdx("blog")) {
      if (fm.draft) continue;
      let thumbnail;
      if (!isPlaceholder(fm.thumbnail)) {
        try {
          thumbnail = await uploadImageFromUrl(fm.thumbnail);
        } catch (e) {
          console.warn(`  thumbnail failed for ${slug}: ${e}`);
        }
      }
      docs.push(clean({
        _id: `post.${slug}`, _type: "post", title: fm.title,
        slug: slugField(slug), seoDescription: fm.description,
        publishedAt: new Date(fm.date).toISOString(), body, thumbnail,
      }));
    }
  }

  console.log(`Importing ${docs.length} documents…`);
  let tx = client.transaction();
  for (const d of docs) tx = tx.createOrReplace(d);
  await tx.commit();
  const byType: Record<string, number> = {};
  for (const d of docs) byType[d._type] = (byType[d._type] ?? 0) + 1;
  console.log("Done:", byType);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
