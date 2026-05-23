You are a senior frontend designer writing the implementation of a small Astro component for a designer's portfolio. Your job is to build a self-contained component called `KineticLead` that renders the homepage's lead statement, with the italic phrase "Primary and Chronic Care" treated as kinetic letterforms whose variable-font weight axis subtly tracks cursor proximity.

This component will be imported by `src/pages/index.astro` (another model is doing that integration in parallel). The integration contract is FIXED — do not change the file path, component name, or rendered structure described below.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents of `src/components/KineticLead.astro` — no markdown code fences, no preamble, no "Here is the file" text.
- The file must be valid Astro syntax that compiles with Astro 5 + TypeScript.
- Do not invent imports. The component is self-contained: no images, no external libraries.

FILE TO WRITE
src/components/KineticLead.astro

INTEGRATION CONTRACT (do not deviate)
- Path: `src/components/KineticLead.astro`
- Props: none. Used as `<KineticLead />`.
- Renders, at the top level, a `<section class="lead" aria-label="Lead statement">` containing exactly two paragraphs:
  1. `<p class="display display-lg text-balance">` — the lead statement.
  2. `<p class="lead-meta">` — the meta line.
- The lead-meta paragraph reads, verbatim:
  `Pune, Maharashtra · Six years at the intersection of design and engineering.`
- The lead statement reads, verbatim, with the italic phrase wrapped:
  `Alok Kumar designs at Fold Health — building <span class="display-italic kinetic-phrase">Primary and Chronic Care</span> for clinicians and patients.`
- Inside `.kinetic-phrase`, each non-whitespace character must be wrapped in `<span class="kinetic-letter" data-i="{index}">{char}</span>`. Whitespace stays as plain text between spans (do NOT wrap spaces in spans). Index is the 0-based position of the letter within the phrase, ignoring spaces.

AVAILABLE CSS CLASSES (use by name; do not redefine in global scope)
- `.display`, `.display-lg`, `.display-italic` — set in `src/styles/global.css`. `.display-italic` already uses Fraunces with `font-variation-settings: "opsz" 144, "SOFT" 50;` and `font-weight: 400`.
- `.text-balance`, `.lead-meta`, `.lead` — also used by the surrounding page. `.lead` and `.lead-meta` are styled inline in `src/pages/index.astro` today; the parent page will keep those styles, so do NOT re-declare them here.

WHAT THIS COMPONENT MUST OWN
- The `<span class="kinetic-letter">` styling (inline-block, will-change: font-variation-settings, transform-origin baseline).
- The scoped `<script>` that drives the kinetic effect.
- Nothing else. Do not touch `.lead`, `.lead-meta`, `.display`, `.display-lg`.

KINETIC LETTERFORM BEHAVIOR (the design)
- Each `.kinetic-letter` animates its `font-variation-settings` `wght` axis between a resting value (380) and a peak value (520) based on cursor proximity to the letter's center.
- Radius of influence: 140px. Beyond 140px, the letter sits at rest. At 0px it sits at peak.
- Falloff is a smooth ease-out, not linear: use `1 - (d / 140)` clamped to [0,1], then squared, so the effect concentrates around the closest letter and falls off gracefully.
- The `opsz` axis stays at 144 (matches `.display-italic`). The `SOFT` axis also stays at 50.
- The cursor-driven weight is lerped (factor ~0.12 per frame) toward its target so motion never snaps.
- The cursor position is sampled on `pointermove` at the document level (so the effect works whether the cursor is over the phrase or near it). Use `requestAnimationFrame` to update letters at most once per frame.
- Recompute each letter's center position on resize, on `astro:after-swap`, and lazily once on first frame after mount. Use `getBoundingClientRect()`; cache in an array.
- When the document has no recent pointer activity (`> 1500ms` since last `pointermove`), all letters lerp back to rest. Do not stop the rAF loop while any letter is still off-rest; once all letters are within 1.5 units of rest, cancel the loop until the next `pointermove`.
- Bind on initial load AND on `astro:after-swap` (Astro View Transitions are enabled site-wide). Guard against double-binding with a `data-bound` attribute on the root element.

STATES & ACCESSIBILITY
- If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, do NOT attach any pointer listeners and do NOT modify `font-variation-settings`. The letters render as plain `.display-italic`.
- If the primary pointer is coarse (`window.matchMedia('(pointer: coarse)').matches`), also skip the kinetic behavior — touch devices get the static phrase. This matches the editorial restraint: no faux-interaction for users who can't see it.
- The `<span class="kinetic-letter">` must not break accessible reading: do NOT add `aria-hidden`, do NOT add per-letter labels. Screen readers see a normal phrase. (Single-letter spans are fine; the words still read continuously because we keep the surrounding text intact.)
- The phrase's spaces remain plain text nodes, NOT wrapped in spans, so line-break behavior is identical to the un-spanned version.

RESTRAINT RULES (do not violate)
- NO color shifts. NO scale changes. NO 3D, NO blur, NO opacity flicker.
- NO motion beyond the variable-axis weight lerp.
- NO entry animation on the letters themselves (the page's existing `.animate-fade-in` on the parent paragraph still runs; do not add competing animation).
- NO autoplay / no idle "breathing" — the effect only responds to pointer input.
- The peak weight (520) is the ceiling. Do not exceed it; Fraunces gets brittle past ~560 at display optical size.

IMPLEMENTATION HINTS
- The frontmatter is empty (or only an empty `---` block). The component has no server-side props.
- Generate the per-letter spans in the Astro template by splitting the phrase string and emitting spans with `{index}`. Do this at build time, in the frontmatter, so the markup is static HTML, not client-rendered.
- Scoped `<style>` should define `.kinetic-phrase` (display: inline) and `.kinetic-letter` (display: inline-block; font-variation-settings: "wght" 380, "opsz" 144, "SOFT" 50; will-change: font-variation-settings). Astro's scoped CSS will not leak.
- The scoped `<script>` should be a normal Astro `<script>` block (NOT `is:inline`, NOT `type="module"`). It will run once per navigation.
- Use `querySelectorAll('.kinetic-letter')` scoped from a single root (`document.querySelectorAll` is fine since the component is unique on the page).
- TypeScript-safe casts where needed (`as HTMLElement`).

Now write `src/components/KineticLead.astro` and only that file.
