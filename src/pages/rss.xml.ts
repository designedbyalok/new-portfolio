import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAllPosts } from "../lib/cms";

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getAllPosts();

  return rss({
    title: "Alok Kumar — Blog",
    description:
      "Notes from the desk — design, healthcare, and building things.",
    site: context.site ?? "https://designedbyalok.com",
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      link: `/blog/${post.slug}/`,
      pubDate: post.date ? new Date(post.date) : undefined,
    })),
    customData: "<language>en</language>",
  });
}
