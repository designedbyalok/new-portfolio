You are writing an Astro 5 dynamic route for a designer's portfolio.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- WRAP top-level page content in `<div class="container-edge container-content">` (and use `container-prose` for the prose-width inner sections).
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax.
- Size variants: `.display-lg`, `.display`, `.display-sm`. `.lede` for serif lead paragraphs.

FILE TO WRITE
src/pages/projects/[slug].astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";

STATIC PATHS
export async function getStaticPaths() {
  const entries = await getCollection("projects");
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

type Props = { entry: CollectionEntry<"projects"> };
const { entry } = Astro.props;
const { Content } = await render(entry);

ENTRY SHAPE
entry.data = {
  title: string,
  tagline: string,
  period: string,
  role?: string,
  tags: string[],
  external?: string,
  order: number,
  idea: string,
  problem: string,
  solution: string,
  whyUnique: string,
}

AVAILABLE CSS CLASSES
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .container-prose, .prose, .text-balance, .text-pretty

DESIGN INTENT
A project case-study page. Editorial, calm, idea-led.

LAYOUT (top to bottom)

1. Header block (.container-content):
   - ~5rem top padding
   - .eyebrow "Project — {entry.data.period}"
   - .display title (entry.data.title, ~text-5xl)
   - A large serif lead (.font-serif, ~text-2xl, max-width 40ch, weight 380): entry.data.tagline
   - A small row of tags as pills (border 1px solid var(--rule), rounded full, padding 0.2rem 0.55rem, ink-muted, text-xs). Gap 0.5rem.
   - If entry.data.external: a quiet "Visit project ↗" link, .link.link-accent
   - If entry.data.role: a small "Role: {role}" line, sans, ink-muted, text-sm

2. The four-question framework (use .container-prose width). For each of these four blocks, layout as:
   - .eyebrow with the label
   - Below it, a serif lead-style paragraph (~text-xl, line-height 1.5, max-width 60ch, weight 380)
   - ~3rem vertical space between blocks
   
   Labels and content:
   - "The Idea" — entry.data.idea
   - "The Problem" — entry.data.problem
   - "The Solution" — entry.data.solution
   - "Why this is unique" — entry.data.whyUnique

3. Body block (.container-prose .prose):
   - Render <Content /> for the markdown body.

4. Footer rule: an hr, then a small row with .eyebrow "Next" and a .link.link-accent serif link "Back to projects →" → /projects

LAYOUT WRAPPER
<Layout title={`${entry.data.title} — Alok Kumar`} description={entry.data.tagline}>

Output src/pages/projects/[slug].astro:
