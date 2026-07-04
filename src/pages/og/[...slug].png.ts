import type { APIRoute } from "astro";
import { renderOgImage } from "../../lib/og";
import { getAllPosts } from "../../lib/cms";
import { getBooks } from "../../lib/books";
import { getFilms } from "../../lib/films";
import { getWorks } from "../../lib/works";
import { getIdeas } from "../../lib/ideas";
import { getArchive } from "../../lib/archive";

export const prerender = true;

type OgProps = { title: string; eyebrow: string };

export async function getStaticPaths() {
  const [posts, books, films, works, ideas, archive] = await Promise.all([
    getAllPosts(),
    getBooks(),
    getFilms(),
    getWorks(),
    getIdeas(),
    getArchive(),
  ]);

  const paths: { params: { slug: string }; props: OgProps }[] = [];
  const add = (slug: string, title: string, eyebrow: string) =>
    paths.push({ params: { slug }, props: { title, eyebrow } });

  for (const p of posts) add(`blog/${p.slug}`, p.title, "Writing");
  for (const b of books) add(`books/${b.slug}`, b.title, "Reading");
  for (const f of films)
    add(`films/${f.slug}`, `${f.title} (${f.metadata.year})`, "Cinema");
  for (const w of works) add(`work/${w.slug}`, w.metadata.company, "Work");
  for (const i of ideas) add(`projects/${i.slug}`, i.title, "Ideas");
  for (const a of archive) add(`archive/${a.slug}`, a.title, "Archive");

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { title, eyebrow } = props as OgProps;
  const png = await renderOgImage(title, eyebrow);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
