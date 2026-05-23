You are writing an Astro 5 dynamic route for a designer's portfolio.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- Use Astro 5's `astro:content` API: getCollection, render.
- WRAP top-level page content in `<div class="container-edge ...">` with the right inner container (container-content for general, container-prose for prose-width).
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax. Just write CSS directly between the tags.
- Size variants available as classes: `.display-lg`, `.display`, `.display-sm`. `.lede` exists for editorial serif lead paragraphs.

FILE TO WRITE
src/pages/work/[slug].astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";

STATIC PATHS PATTERN (use exactly this)
export async function getStaticPaths() {
  const entries = await getCollection("work");
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

type Props = { entry: CollectionEntry<"work"> };
const { entry } = Astro.props;
const { Content } = await render(entry);

ENTRY SHAPE
entry.data = {
  company: string,
  role: string,
  period: string,
  summary: string,
  website: string (URL),
  order: number,
  projects: { title: string, description: string, href?: string }[],
  testimonial?: { quote: string, author: string, role?: string },
}
entry.body — markdown source (already rendered by <Content />)

AVAILABLE CSS CLASSES
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .container-prose, .container-wide, .prose, .text-balance, .text-pretty

DESIGN INTENT
Editorial company portrait. Calm, generous, type-led. No cards.

LAYOUT (top to bottom)

1. Header block (.container-content):
   - ~5rem top padding
   - .eyebrow with text "Work — {entry.data.period}"
   - .display headline showing entry.data.company (use ~text-5xl to text-6xl)
   - Below, in sans ink-muted: "{entry.data.role}"
   - Below, a large serif lead paragraph (~text-2xl, font-serif, weight 380, max-width 40ch): {entry.data.summary}
   - Below, a row with two quiet links: "Visit {company} ↗" → entry.data.website target=_blank, and "Back to work" → /work
   - ~5rem bottom padding

2. Body block (.container-prose .prose):
   - Render <Content /> here so the markdown body shows as long-form prose.

3. Projects block (only if entry.data.projects.length > 0):
   - ~5rem top padding
   - .eyebrow "Selected projects"
   - .container-prose width
   - For each project: a horizontal hr above, then the project title in serif (~text-2xl, weight 440), then the description in sans (ink-muted, text-pretty, max-width 55ch). If project.href exists, add "Read more ↗" link below the description.

4. Testimonial block (only if entry.data.testimonial):
   - ~5rem top padding, 3rem bottom
   - Center this block inside .container-content
   - The quote rendered as a large italic serif pullquote (.display-italic, ~text-3xl, line-height ~1.15, text-balance, max-width 30ch, centered)
   - Below the quote, a smaller line: "— {author}, {role}" — sans, ink-muted, text-sm.

5. Closing rule: an hr, then a small row inside .container-content with:
   - .eyebrow "Next" and
   - A serif link "Back to work →" pointing to /work, .link.link-accent

LAYOUT WRAPPER
<Layout title={`${entry.data.company} — Alok Kumar`} description={entry.data.summary}>

Output src/pages/work/[slug].astro:
