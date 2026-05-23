You are writing an Astro 5 page for a designer's portfolio.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- Use Astro 5's `astro:content` API (NOT the legacy `Astro.glob`).
- WRAP top-level page content in `<div class="container-edge container-content">` (or container-prose for prose pages, container-wide for full-bleed).
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax. Just write CSS directly between the tags.
- Size variants are available as classes: `.display-lg`, `.display`, `.display-sm` — use these instead of inventing font-size utilities.
- `.lede` class exists for editorial serif lead paragraphs (max-width 50ch, ink-muted, responsive size).

FILE TO WRITE
src/pages/work/index.astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";
import { getCollection } from "astro:content";

DATA
const entries = (await getCollection("work")).sort((a, b) => a.data.order - b.data.order);

Each entry has:
- entry.id (string, the slug — used in the URL)
- entry.data.company (string)
- entry.data.role (string)
- entry.data.period (string)
- entry.data.summary (string)
- entry.data.website (URL string)

AVAILABLE CSS CLASSES
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .container-wide, .text-balance, .text-pretty

AVAILABLE CSS VARS
--paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent
--font-sans, --font-serif, --text-2xs through --text-6xl

DESIGN INTENT
This is a Work index page. Treat it like an editorial table of contents — not cards.

LAYOUT
- Layout wrapper with title "Work — Alok Kumar" and description "Six years across studios, an early-stage startup, and a healthtech company."
- Page padding: container-edge + container-content
- Top of page: ~6rem padding, then an .eyebrow "Work, 2020 — present" and a .display headline "Places I've worked.", left-aligned.
- Below, a vertical list of entries. For each:
  - A horizontal rule (hr) above the entry
  - Two-column row at desktop (period on left ~25%, content on right ~75%), single column at mobile
  - Left column: .eyebrow showing entry.data.period
  - Right column:
      - Large serif company name (use .display, ~text-3xl, weight ~420)
      - Below it: entry.data.role in sans, ink-muted
      - Below that: entry.data.summary in sans, normal size, text-pretty, max-width ~55ch
      - Below: a small row with two links — "Read more →" linking to `/work/${entry.id}` (use .link.link-accent), and "Visit company ↗" linking to entry.data.website target="_blank" (use .link)
  - Generous padding: ~3rem between entries

VERTICAL RHYTHM
- ~6rem above the page headline
- ~4rem between the headline and the first entry
- ~3rem padding inside each row
- After the last entry, an hr and ~6rem before the page ends (Footer follows)

Output src/pages/work/index.astro:
