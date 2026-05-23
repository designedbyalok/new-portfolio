You are writing an Astro 5 page for a designer's portfolio.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- Use Astro 5's `astro:content` API.
- WRAP top-level page content in `<div class="container-edge container-content">`.
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax.
- Size variants: `.display-lg`, `.display`, `.display-sm`. `.lede` for serif lead paragraphs.

FILE TO WRITE
src/pages/projects/index.astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";
import { getCollection } from "astro:content";

DATA
const entries = (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);

Each entry has:
- entry.id (string, slug)
- entry.data.title (string)
- entry.data.tagline (string)
- entry.data.period (string)
- entry.data.role (string | undefined)
- entry.data.tags (string[])
- entry.data.external (string | undefined, URL)

DESIGN INTENT
Projects index — editorial, project-led. Each project listed like a magazine table of contents.

AVAILABLE CSS CLASSES & VARS
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .text-balance, .text-pretty
--paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent, --font-sans, --font-serif

LAYOUT
- Wrap in <Layout title="Projects — Alok Kumar" description="Projects worth telling you about: idea, problem, solution, and why it was unique.">
- ~5rem top padding inside .container-edge .container-content
- .eyebrow "Projects" then .display "Projects worth telling you about."
- ~4rem space
- Vertical list. Each entry:
  - An hr above
  - ~3rem internal padding
  - Two-column grid at desktop: left column ~30% has .eyebrow "{entry.data.period}", right column ~70% has:
    - Serif title (~text-3xl, weight 420), as a link to /projects/{entry.id}, color ink, hover accent
    - Tagline in sans, normal weight, text-pretty, max-width 55ch
    - A small row of tags: each tag a tiny pill — small text, padding 0.2rem 0.55rem, border 1px solid var(--rule), rounded full, color ink-muted. Gap 0.5rem between pills.
    - If external link exists: a "Live ↗" link (.link.link-accent), small sans, opens in new tab.
- After last entry, an hr and ~6rem trailing space.

Output src/pages/projects/index.astro:
