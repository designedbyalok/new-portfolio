You are a senior frontend designer reviewing an existing portfolio codebase. Your job is to design the spec for a photo carousel component that will replace the static photo grids on the Work detail and Project detail pages.

CONTEXT
- The site is Astro 5 + Tailwind v4 + custom CSS variables.
- The current grid lives on `src/pages/work/[slug].astro` and `src/pages/projects/[slug].astro` under `.photo-grid` / `.proj-photo-grid`. It iterates an array of `{ src, caption, aspect }`.
- The site is editorial, type-led, restrained. No flashy effects. Existing reference points: hover scale on image (transform: scale(1.02)), generous whitespace, accent color used sparingly.
- Available CSS classes: .display, .display-lg, .display-sm, .eyebrow, .link, .link-accent, .container-edge, .container-content, .container-wide.
- Available CSS vars: --paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent, --accent-soft, --font-sans, --font-serif.

YOUR DELIVERABLE
A self-contained spec — under 600 words total — that will be handed to a separate code-generation model. The model will write the component without knowing this context, so the spec must be explicit. Structure:

1. **Component API.** Astro props shape and TypeScript-style type. Example:
   ```
   { items: { src: string; caption?: string; aspect?: string }[]; ariaLabel?: string }
   ```

2. **Visual layout.** What the user sees. Be precise: scroll direction, gap, peek of next slide, caption position, snap behavior. Don't say "looks nice"; say what specifically.

3. **Interactions.** Cover: mouse wheel, touch swipe, keyboard (arrow keys, Home/End, Tab focus), scrollbar visibility, snap behavior, what counts as "current" slide, dot indicators or none.

4. **States to handle.**
   - 0 items (render nothing or empty state)
   - 1 item (no need for prev/next controls)
   - 2+ items (full controls)
   - First slide (disable prev) and last slide (disable next)
   - Reduced motion: turn off smooth scroll behavior

5. **Implementation hints.** Tell the code-model:
   - Use native CSS scroll-snap, NOT a JS scroll library.
   - Use IntersectionObserver to track which slide is in view.
   - Buttons are absolute-positioned overlays that fade in on hover/focus.
   - No external dependencies. No `<script type="module">` imports.
   - Astro `<script>` blocks (not is:inline) handle the IntersectionObserver and button clicks.

6. **Restraint rules.** Things explicitly NOT to do — no autoplay, no parallax, no kenburns zoom, no fancy entry animations beyond a single fade-in on image load.

The spec ends without commentary or sign-off. Output only the spec.
