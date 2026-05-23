You are writing an Astro 5 page for a designer's portfolio.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- WRAP top-level page content in `<div class="container-edge container-content">`.
- Astro `<style>` blocks hold PLAIN CSS only. Never wrap CSS in `{ \`...\` }` template-literal syntax.
- Size variants: `.display-lg`, `.display`, `.display-sm`. `.lede` for serif lead paragraphs.

FILE TO WRITE
src/pages/about.astro

REQUIRED IMPORTS
import Layout from "../../layouts/Layout.astro";

AVAILABLE CSS CLASSES
.display, .display-italic, .eyebrow, .link, .link-accent, .container-edge, .container-content, .container-prose, .text-balance, .text-pretty

AVAILABLE CSS VARS
--paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent

DESIGN INTENT
Editorial, off-the-clock About page. The portfolio's most personal page. Use restrained but warm tone.

CONTENT TO INCLUDE (verbatim where quoted)

The page is divided into vertical sections. Each section starts with an .eyebrow and a small serif title, then content.

Helper: a placeholder image block. Use a `<div class="photo-ph aspect-[4/5]">` (or 3/2, 1/1 — vary across sections) styled with background var(--paper-deep), border 1px solid var(--rule), border-radius 4px, and a centered .eyebrow "photo" in ink-faint. Real photos go in later. Use these placeholders generously to show how the gallery will look.

SECTIONS (in order)

1. PAGE HEADER (.container-content, ~5rem top padding)
   - .eyebrow "About"
   - .display "Off-screen." (large, ~text-5xl)
   - Serif lead (.font-serif, ~text-xl, weight 380, max-width 50ch, ink-muted): "The things I think about when I'm not designing. The photos, the music, the books, the small obsessions."

2. ME (asymmetric grid: left ~40% photo, right ~60% text — at mobile, photo above text)
   - Eyebrow "Me"
   - One large portrait photo placeholder (aspect 4/5)
   - On the right, a serif paragraph (.font-serif, ~text-xl, weight 380, max-width 45ch):
     "Born in Bokaro Steel City. Studied Computer Science but the design bug bit harder. Now in Pune, designing care software at Fold Health — and trying to remember to leave the desk once in a while."

3. FRIENDS, TRIPS, AT WORK (grid of small photo placeholders)
   - Eyebrow "In the world"
   - A 3-column grid (single column at mobile) showing 6 photo placeholders mixed across aspect ratios (mix 4/5, 3/2, 1/1). Each photo placeholder includes a tiny serif caption underneath (in italic, ink-muted, text-sm) — make up reasonable captions like "Coffee with Adi, 2024", "Vagamon, Kerala — 2023", "At the Fold offsite, 2024", "Bangalore design week", "Trekking in Himachal", "Sketching at the desk".

4. MUSIC (.container-prose width, single column)
   - Eyebrow "Music"
   - Serif paragraph: "Mostly post-rock and instrumental at the desk — Tycho, Mogwai, Nils Frahm. Anything with mood and few words."
   - Below: a small two-column list (label / value) styled cleanly:
     - "On repeat" — "Tycho, Awake"
     - "All-time" — "Stranger in the Alps — Phoebe Bridgers"
     - "Live, recently" — "Bonobo, Pune, 2024"

5. MOVIES — same pattern as Music
   - Lead: "I prefer the long, slow ones — directors who trust the audience to sit with a frame."
   - List:
     - "Recently loved" — "Past Lives (2023)"
     - "Forever" — "In the Mood for Love (2000)"
     - "Comfort rewatch" — "Before Sunrise (1995)"

6. BOOKS — same pattern
   - Lead: "Nonfiction-heavy, a little philosophy, the occasional novel."
   - List:
     - "Reading now" — "The Design of Everyday Things — Don Norman"
     - "Recently" — "Four Thousand Weeks — Oliver Burkeman"
     - "Reread" — "Steal Like an Artist — Austin Kleon"

7. LEGOS (medium photo placeholder, 4/5 aspect, with serif paragraph beside)
   - Eyebrow "Legos"
   - Serif paragraph: "I collect a few sets a year — usually architecture or technic. The Eiffel Tower is currently in pieces on the dining table."

8. ART (a 2-column grid of square placeholders, 4 squares, each with a tiny caption)
   - Eyebrow "Art"
   - Captions like "Ink, 2024", "Pen on Moleskine, 2023", "Watercolor study, 2024", "Charcoal, 2022"

9. PHOTOGRAPHY (a 3-column grid of varied-aspect placeholders, 6 photos, captions like "Pune morning, 2024", "Goa, 2023", "Backwaters, Kerala", "Streetlight study", "Window, Mumbai", "Old Delhi")

10. CLOSING (.container-content)
   - An hr
   - .eyebrow "Reach me"
   - A serif line: "Always up to talk — design, music, books, or whatever else."
   - A row of links: designedbyalok@gmail.com, Twitter, LinkedIn — all .link.link-accent
   - ~6rem bottom space

LAYOUT WRAPPER
<Layout title="About — Alok Kumar" description="The things I think about when I'm not designing.">

Use <style> at the bottom of the .astro file for the .photo-ph utility class and any grid styles. Keep CSS tight, use design tokens.

Output src/pages/about.astro:
