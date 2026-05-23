You are writing an Astro 5 dynamic route for blog posts.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- WRAP top-level page content in `<div class="container-edge ...">` (container-prose for the article body, container-content for header).
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax.
- Size variants: `.display-lg`, `.display`, `.display-sm`. `.lede` for serif lead paragraphs.

FILE TO WRITE
src/pages/blog/[slug].astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";

STATIC PATHS
export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

type Props = { post: CollectionEntry<"blog"> };
const { post } = Astro.props;
const { Content } = await render(post);

const formattedDate = post.data.date.toLocaleDateString("en-US", {
  year: "numeric", month: "long", day: "numeric"
});

ENTRY SHAPE
post.data = {
  title: string,
  description: string,
  date: Date,
  thumbnail?: ImageMetadata,
  tags: string[],
  readTime?: string,
}

AVAILABLE CSS CLASSES
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .container-prose, .prose, .text-balance, .text-pretty

DESIGN INTENT
A long-form post page. Magazine-quality typography. Beautifully calm.

LAYOUT (top to bottom)

1. Header block (.container-prose, centered):
   - ~6rem top padding
   - .eyebrow "Blog · {formattedDate}{post.data.readTime ? ' · ' + post.data.readTime : ''}"
   - .display title (~text-5xl on desktop, text-3xl mobile, line-height 0.95, text-balance), centered
   - Below the title, a serif lead (.font-serif italic, ~text-xl, weight 400, ink-muted, max-width 50ch, centered, text-pretty): post.data.description
   - A small row of tags (pills, same styling as projects). Centered.
   - ~3rem bottom padding

2. (If thumbnail exists, render it full-width inside .container-content, with rounded-md, otherwise skip)

3. Body (.container-prose .prose):
   - Render <Content />

4. Footer block:
   - An hr at ~4rem top margin
   - Inside .container-prose: .eyebrow "Notes" then two lines:
     - A serif line: "Thanks for reading."
     - A small line: "If anything caught your eye — write to me at designedbyalok@gmail.com." (link the email with .link.link-accent)
   - Below, .link.link-accent "← All notes" → /blog
   - ~6rem bottom padding

LAYOUT WRAPPER
<Layout title={`${post.data.title} — Alok Kumar`} description={post.data.description}>

Output src/pages/blog/[slug].astro:
