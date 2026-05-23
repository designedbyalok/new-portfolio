You are writing Astro components for a designer's portfolio. The site uses Astro 5 + Tailwind v4 (utility classes available) + custom CSS variables.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents — no markdown code fences, no explanation, no "Here is the file" text.
- The file should be valid Astro syntax that compiles.
- Do not invent imports that don't exist.

FILE TO WRITE
src/pages/index.astro

AVAILABLE IMPORTS (use exactly these paths if needed)
import Layout from "../layouts/Layout.astro";

AVAILABLE CSS CLASSES (use these by name; do not redefine)
- .display           — serif (Fraunces) display type; use for the lead statement
- .display-italic    — italic serif accent
- .eyebrow           — small uppercase label, letter-spaced
- .link              — animated baseline underline on hover
- .link-accent       — link that turns accent color on hover
- .container-edge    — left/right page padding using clamp()
- .container-content — max-width 1100px, centered
- .container-wide    — max-width 1400px, centered
- .text-balance, .text-pretty — text-wrap utilities

AVAILABLE CSS VARIABLES (use inside <style> tags if needed)
--paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent, --accent-soft
--font-sans, --font-serif, --font-mono
--text-xs, --text-sm, --text-base, --text-lg, --text-xl, --text-2xl, --text-3xl, --text-4xl, --text-5xl, --text-6xl

LAYOUT PROPS
<Layout title="..." description="..."> wraps page content. Set:
  title: "Alok Kumar — Product Designer"
  description: "Product Designer at Fold Health. Six years designing systems and interactions at the intersection of design and engineering."

CONTENT TO INCLUDE (verbatim where quoted)
1. A lead statement, large, serif, asymmetric (left-aligned, with right-side breathing room):
   "Alok Kumar designs at Fold Health — building Primary and Chronic Care for clinicians and patients."
   The first word "Alok Kumar" should be the same size as the rest. The phrase "Primary and Chronic Care" should be in italic serif (.display-italic) to give a small editorial accent.

2. Below it, smaller sans, ink-muted: "Pune, Maharashtra · Six years at the intersection of design and engineering."

3. A "Currently" block (uses .eyebrow for the label):
   - Eyebrow: "Currently"
   - Two lines:
     - "Designing Fold's care platform and design system."
     - "Listening to Tycho — Awake."  (this last line is a placeholder; mark in an HTML comment that it can be wired to Spotify later)

4. A "Find me" block (uses .eyebrow):
   - Eyebrow: "Find me"
   - A short row of links with subtle dot separators (·):
     GitHub (https://github.com/designedbyalok) · Twitter (https://x.com/designedbyalok) · LinkedIn (https://www.linkedin.com/in/designedbyalok/) · Dribbble (https://dribbble.com/designedbyalok)
   - Use the .link.link-accent classes on each link. Open external links in new tabs (target="_blank" rel="noopener noreferrer").

5. A quiet "Read on" block (uses .eyebrow):
   - Eyebrow: "Read on"
   - Four large editorial-feeling links in a single column with serif font, generous line-height — to /work, /projects, /blog, /about. Labels:
     "The work I've shipped → /work"
     "Projects worth telling you about → /projects"
     "Notes from the desk → /blog"
     "More about me, off-screen → /about"
   - Each link should be .link with the arrow as the accent. Color it ink by default, accent on hover.

VISUAL DIRECTION
- Editorial, restrained, calm. Lots of whitespace. NO cards, NO borders, NO grid template.
- Use asymmetric layout: the lead statement and subsequent blocks live in a column that is roughly 70% of the content width, hugging the left.
- Generous vertical rhythm: at least 5rem between major blocks at desktop, 2.5rem at mobile.
- Top of page should have ~6rem of breathing space before the lead.

STRUCTURE
Use semantic HTML: <section> for each block, with aria-labels where helpful.

You may use a <style> block at the end of the .astro file for page-specific styles (scoped automatically). Keep styles tight and use the design tokens. No external dependencies beyond what's listed.

Now write src/pages/index.astro:
