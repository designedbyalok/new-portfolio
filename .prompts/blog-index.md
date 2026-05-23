You are writing an Astro 5 page for a designer's portfolio.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- WRAP top-level page content in `<div class="container-edge container-content">`.
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax.
- Size variants: `.display-lg`, `.display`, `.display-sm`. `.lede` for serif lead paragraphs.

FILE TO WRITE
src/pages/blog/index.astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";
import { getCollection } from "astro:content";

DATA
const posts = (await getCollection("blog", ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

Each post has:
- post.id (slug)
- post.data.title (string)
- post.data.description (string)
- post.data.date (Date — format with toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
- post.data.tags (string[])
- post.data.readTime (string | undefined)
- post.data.thumbnail (ImageMetadata | undefined)

AVAILABLE CSS CLASSES
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .text-balance, .text-pretty

DESIGN INTENT
A blog index that feels like a magazine cover-flow. Beautiful, generous, restrained.

LAYOUT
- <Layout title="Blog — Alok Kumar" description="Notes from the desk.">
- ~5rem top padding inside .container-edge .container-content
- .eyebrow "Notes" and .display "Things I've been writing about." (text-balance)
- ~4rem space, then a vertical list of post entries (not a grid):

For each post:
  - An hr above
  - ~3rem internal padding
  - Two-column at desktop (left ~58% text, right ~42% thumbnail), single column on mobile (text first, thumbnail below)
  - Left column:
    - .eyebrow showing the formatted date and (if readTime) " · {readTime}"
    - Title in serif (~text-3xl, weight 420), as a link to /blog/{post.id}, color ink, hover accent — text-balance
    - Description in sans, normal, text-pretty, max-width 55ch, color ink-muted
    - A small row of tags as pills (border 1px solid var(--rule), rounded full, padding 0.15rem 0.5rem, ink-muted, text-xs)
    - At the bottom, a "Read on →" link (.link.link-accent)
  - Right column: if post.data.thumbnail exists, show it as an image inside an aspect-ratio container (3 / 2). If thumbnail is undefined, instead show a placeholder block: a square-ish element ~aspect-[3/2] with background var(--paper-deep), a thin inner border 1px solid var(--rule), and a centered .eyebrow "thumbnail" text in ink-faint. This shows the placement before real images land.

- Trailing hr and ~6rem space at the end.

Output src/pages/blog/index.astro:
