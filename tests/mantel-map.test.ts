import assert from "node:assert/strict";
import test from "node:test";
import { piecesFor, type MantelContent, type MantelPiece } from "../src/lib/mantel-map";

const MEDIA = "https://mantel.example/media/site_1";

function piece(overrides: Partial<MantelPiece>): MantelPiece {
  return { id: "item_x", collection: "blog", slug: "x", title: "X", body: "", metadata: {}, description: "", featured: false, archived: false, sortOrder: 0, ...overrides };
}

const content: MantelContent = {
  id: "rev_1",
  assets: [{ id: "asset_coast", path: `${MEDIA}/asset_coast/coast.jpg`, width: 1600, height: 1200, alt: "Coast at dusk" }],
  items: [
    piece({ id: "p1", slug: "older", title: "Older", body: "Old body", metadata: { publishedAt: "2025-01-01" }, publishedAt: "2026-10-01T00:00:00.000Z" }),
    piece({ id: "p2", slug: "newer", title: "Newer", body: "# Heading\n\nNew body", description: "", metadata: { publishedAt: "2026-02-01", seoDescription: "## The *SEO* line", thumbnail: `${MEDIA}/asset_t/t.jpg` } }),
    piece({ id: "p3", slug: "gone", title: "Archived", archived: true }),
    piece({
      id: "b1", collection: "books", slug: "dune", title: "Dune",
      metadata: { author: "Frank Herbert", status: "finished", rating: 5, finishedAt: "2026-01-02", cover: `${MEDIA}/asset_c/cover.jpg`, review: "Sand." },
    }),
    piece({ id: "f1", collection: "films", slug: "her", title: "Her", metadata: { year: "2013", director: "Spike Jonze", lists: ["favourites"] } }),
    piece({ id: "a1", collection: "archive", slug: "inversion", title: "Inversion", metadata: { type: "mental-model", tags: "thinking, models" } }),
    piece({
      id: "w1", collection: "work", slug: "fold", title: "Fold", description: "Clinical tools.",
      metadata: {
        company: "Fold Health", role: "Design lead", period: "2023–", order: 1,
        photos: [{ image: `${MEDIA}/asset_w/ward.jpg`, caption: "Ward", aspect: "4 / 5" }, { caption: "no image" }],
        testimonial: { quote: "Sharp.", author: "Someone" },
      },
    }),
    piece({ id: "w2", collection: "work", slug: "roots", title: "Roots", metadata: { company: "Roots", order: 5 } }),
    piece({ id: "i1", collection: "projects", slug: "rules", title: "Rule builder", metadata: { tagline: "Rules for care", order: 2 } }),
    piece({ id: "i2", collection: "caseStudies", slug: "north", title: "North", description: "A study.", metadata: { role: "Design", outcome: "Shipped", order: 1 } }),
    piece({ id: "ph1", collection: "photos", slug: "coast", title: "Coast", description: "The coast", metadata: { image: `${MEDIA}/asset_coast/coast.jpg`, takenAt: "2026-03-01" } }),
  ],
};

test("blog posts keep the CMSPost shape, newest first, without archived pieces", () => {
  const posts = piecesFor(content, "blog");
  assert.deepEqual(posts.map((post) => post.slug), ["newer", "older"]);
  const [newer, older] = posts;
  assert.equal(newer?.collection, "blog");
  assert.equal(newer?.description, "The SEO line");
  assert.equal(newer?.thumbnail, `${MEDIA}/asset_t/t.jpg`);
  assert.deepEqual(newer?.metadata, {});
  assert.equal(older?.description, "Old body");
  assert.equal(older?.updated, "2026-10-01T00:00:00.000Z");
});

test("books, films, and archive entries carry their typed fields", () => {
  const [book] = piecesFor(content, "books");
  assert.equal(book?.thumbnail, `${MEDIA}/asset_c/cover.jpg`);
  assert.equal(book?.description, "Sand.");
  assert.equal(book?.date, "2026-01-02");
  assert.deepEqual({ author: book?.metadata.author, status: book?.metadata.status, rating: book?.metadata.rating }, { author: "Frank Herbert", status: "finished", rating: 5 });

  const [film] = piecesFor(content, "films");
  assert.equal(film?.metadata.year, 2013);
  assert.deepEqual(film?.metadata.lists, ["favourites"]);
  assert.equal(film?.description, "Her");

  const [entry] = piecesFor(content, "archive");
  assert.deepEqual(entry?.metadata, { type: "mental-model", date: undefined, source: undefined, tags: ["thinking", "models"] });
});

test("work keeps its gallery and testimonial, ordered like the old query", () => {
  const work = piecesFor(content, "work");
  assert.deepEqual(work.map((entry) => entry.slug), ["roots", "fold"]);
  const fold = work[1];
  assert.equal(fold?.title, "Fold Health");
  assert.deepEqual(fold?.metadata.photos, [{ src: `${MEDIA}/asset_w/ward.jpg`, caption: "Ward", aspect: "4 / 5" }]);
  assert.deepEqual(fold?.metadata.testimonial, { quote: "Sharp.", author: "Someone" });
  assert.equal(fold?.description, "Clinical tools.");
});

test("the site's projects come from Mantel projects and case studies", () => {
  const ideas = piecesFor(content, "ideas");
  assert.deepEqual(ideas.map((idea) => idea.slug), ["north", "rules"]);
  assert.equal(ideas[0]?.collection, "ideas");
  assert.equal(ideas[0]?.metadata.tagline, "A study.");
  assert.equal(ideas[0]?.metadata.whyUnique, "Shipped");
});

test("photos take their size and alt text from the stored image", () => {
  const [photo] = piecesFor(content, "photos");
  assert.equal(photo?.thumbnail, `${MEDIA}/asset_coast/coast.jpg`);
  assert.equal(photo?.metadata.aspect, "1600 / 1200");
  assert.equal(photo?.metadata.alt, "Coast at dusk");
  assert.equal(photo?.metadata.caption, "The coast");
});

test("an order set in Mantel wins once a collection has been reordered", () => {
  const reordered: MantelContent = {
    items: [
      piece({ id: "w1", collection: "work", slug: "fold", metadata: { order: 9 }, sortOrder: 2 }),
      piece({ id: "w2", collection: "work", slug: "roots", metadata: { order: 1 }, sortOrder: 1 }),
    ],
  };
  assert.deepEqual(piecesFor(reordered, "work").map((entry) => entry.slug), ["roots", "fold"]);
});

test("a photo without alt text leaves it unset so the gallery falls back to the caption", () => {
  const [photo] = piecesFor({ assets: [{ id: "asset_a", path: `${MEDIA}/asset_a/a.jpg`, width: 10, height: 10, alt: "" }], items: [piece({ collection: "photos", metadata: { image: `${MEDIA}/asset_a/a.jpg` } })] }, "photos");
  assert.equal(photo?.metadata.alt, undefined);
});

test("a preview keeps one page per slug, preferring the published piece", () => {
  const preview: MantelContent = {
    items: [
      piece({ id: "held", slug: "shared", title: "Repo copy", status: "draft" }),
      piece({ id: "live", slug: "shared", title: "Sanity copy", status: "published" }),
      piece({ id: "new", slug: "fresh", title: "New draft", status: "draft" }),
    ],
  };
  assert.deepEqual(piecesFor(preview, "blog").map((post) => post.title).sort(), ["New draft", "Sanity copy"]);
});

test("work carries its kind and links case studies by slug, whatever the source", () => {
  const linked: MantelContent = {
    items: [
      piece({ id: "cs", collection: "projects", slug: "rule-builder", metadata: { sanityId: "idea-rules" } }),
      piece({ id: "w1", collection: "work", slug: "fold", metadata: { company: "Fold", caseStudies: [{ _ref: "idea-rules", _type: "reference" }, { _ref: "drafts.idea-missing" }] } }),
      piece({ id: "w2", collection: "work", slug: "jobstax", metadata: { company: "JobStax", kind: "project", caseStudies: ["rule-builder"] } }),
    ],
  };
  const [fold, jobstax] = piecesFor(linked, "work");
  assert.equal(fold?.metadata.kind, "experience");
  assert.deepEqual(fold?.metadata.caseStudies, ["rule-builder"]);
  assert.equal(jobstax?.metadata.kind, "project");
  assert.deepEqual(jobstax?.metadata.caseStudies, ["rule-builder"]);
});

test("a site comparator keeps the existing order until the collection is reordered in Mantel", () => {
  const items = [
    piece({ id: "a", collection: "work", slug: "old-job", metadata: { company: "Old", period: "2019 — 2021" } }),
    piece({ id: "b", collection: "work", slug: "now-job", metadata: { company: "Now", period: "2023 — Present" } }),
  ];
  const byPeriod = (x: { metadata: unknown }, y: { metadata: unknown }) =>
    String((y.metadata as { period: string }).period).localeCompare(String((x.metadata as { period: string }).period));
  assert.deepEqual(piecesFor({ items }, "work", byPeriod).map((post) => post.slug), ["now-job", "old-job"]);
  const reordered = items.map((item, index) => ({ ...item, sortOrder: index }));
  assert.deepEqual(piecesFor({ items: reordered }, "work", byPeriod).map((post) => post.slug), ["old-job", "now-job"]);
});

test("an empty collection is an empty answer", () => {
  assert.deepEqual(piecesFor({ items: [] }, "books"), []);
});
