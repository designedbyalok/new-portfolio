import type { APIContext } from "astro";
import { getAllPosts } from "../lib/cms";
import { getWorks, getSideProjects } from "../lib/works";
import { getIdeas } from "../lib/ideas";
import { getBooks } from "../lib/books";
import { getFilms } from "../lib/films";
import { getArchive } from "../lib/archive";

export const prerender = true;

/**
 * /llms.txt — machine-readable site map for LLMs, per https://llmstxt.org.
 * Everything below is generated from the content collections — nothing hardcoded.
 */
export async function GET(context: APIContext) {
  const site = context.site ?? new URL("https://designedbyalok.com");
  const abs = (path: string) => new URL(path, site).href;

  const work = await getWorks();
  const sideProjects = await getSideProjects();
  const caseStudies = await getIdeas();
  const books = await getBooks();
  const films = (await getFilms()).sort(
    (a, b) => (b.metadata.year ?? 0) - (a.metadata.year ?? 0),
  );
  const archive = await getArchive();
  const posts = await getAllPosts();

  const lines: string[] = [
    "# Alok Kumar — Product Designer",
    "",
    "> Alok Kumar is a product designer simplifying digital healthcare, based in Pune, India. He has been a Product Designer at Fold Health since June 2023, designing for Primary & Chronic Care — clinical workflows, an automation rule-builder, and the design system behind them. Before that he was the founding designer at Banyan Cloud (enterprise cloud security), where he built and open-sourced the Roots Design System. He has a background in Computer Science (B.E., Anna University), and integrates design and development to deliver holistic, impactful solutions.",
    "",
    "## Work Experience",
    "",
    ...work.map(
      (w) =>
        `- [${w.metadata.company}](${abs(`/work/${w.slug}`)}): ${w.metadata.summary}`,
    ),
    "",
    "## Projects",
    "",
    ...sideProjects.map(
      (w) =>
        `- [${w.metadata.company}](${abs(`/projects/${w.slug}`)}): ${w.metadata.summary}`,
    ),
    "",
    "## Case Studies",
    "",
    ...caseStudies.map(
      (p) => `- [${p.title}](${abs(`/case-studies/${p.slug}`)}): ${p.metadata.tagline}`,
    ),
    "",
    "## Blog",
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
        `- [${b.title}](${abs(`/books/${b.slug}`)}): ${b.metadata.author} — ${b.metadata.status}.`,
    ),
    "",
    "## Cinema",
    "",
    `- [Films](${abs("/films")}): The film log — what Alok has watched and rated.`,
    ...films.map(
      (f) =>
        `- [${f.title} (${f.metadata.year})](${abs(`/films/${f.slug}`)})${f.metadata.director ? `: dir. ${f.metadata.director}` : ""}.`,
    ),
    "",
    "## Archive",
    "",
    `- [Archive](${abs("/about/archive")}): Notes, quotes, mental models, and observations collected over time.`,
    ...archive.map(
      (a) => `- [${a.title}](${abs(`/about/archive/${a.slug}`)}): ${a.metadata.type}.`,
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
