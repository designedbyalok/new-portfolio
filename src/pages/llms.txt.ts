import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { getAllPosts } from "../lib/cms";

export const prerender = true;

/**
 * /llms.txt — machine-readable site map for LLMs, per https://llmstxt.org.
 * Everything below is generated from the content collections and the CMS;
 * nothing that a collection can supply is hardcoded.
 */
export async function GET(context: APIContext) {
  const site = context.site ?? new URL("https://designedbyalok.com");
  const abs = (path: string) => new URL(path, site).href;

  const work = (await getCollection("work")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const projects = (await getCollection("projects")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const books = await getCollection("books");
  const films = (await getCollection("films")).sort(
    (a, b) => b.data.year - a.data.year,
  );
  const archive = await getCollection("archive");
  const posts = await getAllPosts();

  const lines: string[] = [
    "# Alok Kumar — Product Designer",
    "",
    "> Alok Kumar is a product designer simplifying digital healthcare, based in Pune, India. He has been a Product Designer at Fold Health since June 2023, designing for Primary & Chronic Care — clinical workflows, an automation rule-builder, and the design system behind them. Before that he was the founding designer at Banyan Cloud (enterprise cloud security), where he built and open-sourced the Roots Design System. He has a background in Computer Science (B.E., Anna University), and integrates design and development to deliver holistic, impactful solutions.",
    "",
    "## Work",
    "",
    ...work.map(
      (entry) =>
        `- [${entry.data.company}](${abs(`/work/${entry.id}`)}): ${entry.data.summary}`,
    ),
    "",
    "## Projects",
    "",
    ...projects.map(
      (entry) =>
        `- [${entry.data.title}](${abs(`/projects/${entry.id}`)}): ${entry.data.tagline}`,
    ),
    "",
    "## Writing",
    "",
    ...posts.map(
      (post) => `- [${post.title}](${abs(`/blog/${post.slug}`)}): ${post.description}`,
    ),
    "",
    "## Reading",
    "",
    `- [Books](${abs("/books")}): The bookshelf — what Alok is reading, has finished, and recommends.`,
    ...books.map(
      (b) =>
        `- [${b.data.title}](${abs(`/books/${b.id}`)}): ${b.data.author} — ${b.data.status}.`,
    ),
    "",
    "## Cinema",
    "",
    `- [Films](${abs("/films")}): The film log — what Alok has watched and rated.`,
    ...films.map(
      (f) =>
        `- [${f.data.title} (${f.data.year})](${abs(`/films/${f.id}`)})${f.data.director ? `: dir. ${f.data.director}` : ""}.`,
    ),
    "",
    "## Archive",
    "",
    `- [Archive](${abs("/about/archive")}): Notes, quotes, mental models, and observations collected over time.`,
    ...archive.map(
      (a) => `- [${a.data.title}](${abs(`/about/archive/${a.id}`)}): ${a.data.type}.`,
    ),
    "",
    "## Meta",
    "",
    `- [About](${abs("/about")}): Off-screen — photos, music, books, and small obsessions.`,
    `- [Resume](${abs("/resume")}): Full resume with experience, skills, and education.`,
    `- [Resume PDF](${abs("/Alok_Kumar_Resume.pdf")}): Downloadable PDF resume.`,
    `- [Search](${abs("/search")}): Search everything on the site.`,
    `- [RSS feed](${abs("/rss.xml")}): Subscribe to the blog.`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
