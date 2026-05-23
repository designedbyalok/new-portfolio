You are writing an Astro 5 component.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- File MUST start with `---` for Astro frontmatter.
- Astro `<style>` blocks hold PLAIN CSS only. Never `{ \`...\` }` template literals.

FILE TO WRITE
src/components/PhotoCarousel.astro

COMPONENT PURPOSE
Replaces a static photo grid. Horizontal scrolling carousel using native CSS scroll-snap. Has prev/next buttons, dot indicators, keyboard support, captions.

PROPS (TypeScript interface in frontmatter — use exactly this)
interface Photo {
  src: string;
  caption?: string;
  aspect?: string;
}
interface Props {
  items: Photo[];
  ariaLabel?: string;
}
const { items, ariaLabel = "Photo carousel" } = Astro.props;

AVAILABLE DESIGN TOKENS
--paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent, --accent-soft
--font-sans, --font-serif, --text-xs, --text-sm, --text-base, --text-lg, --text-xl

LAYOUT
- Wrapper `<figure class="carousel" aria-roledescription="carousel" aria-label={ariaLabel}>`
  - If items.length === 0, render NOTHING (just empty figure or skip).
  - Otherwise, render:
    - A `<div class="carousel-track" tabindex="0">` that has overflow-x: auto, scroll-snap-type: x mandatory.
    - Inside the track, one `<div class="carousel-slide">` per item with `scroll-snap-align: start`, each containing:
      - An `<div class="slide-frame" style={`aspect-ratio: ${item.aspect ?? "3 / 2"};`}>` with an `<img src={item.src} alt={item.caption ?? ""} loading="lazy" decoding="async">` inside.
      - A `<figcaption class="slide-caption">` if caption exists.
    - Each slide gets `data-slide-index` 0..N.
- If items.length > 1, also render:
  - A controls row `<div class="carousel-controls">`:
    - `<button type="button" class="carousel-btn carousel-prev" aria-label="Previous photo">‹</button>`
    - `<ol class="carousel-dots" role="tablist">` with one `<li><button class="carousel-dot" data-dot-index={i} aria-label={`Go to photo ${i+1}`}></button></li>` per item.
    - `<button type="button" class="carousel-btn carousel-next" aria-label="Next photo">›</button>`

BEHAVIOR (in a single non-inline `<script>` block)
- Bind on initial load AND on `astro:after-swap`. Use a `data-bound` flag on the .carousel root to avoid double-binding.
- Track current slide via IntersectionObserver on slides (threshold 0.6). When a slide intersects, set it as current → update active dot + disable prev when at first + disable next when at last.
- Prev/Next buttons scroll the track by one slide width using `track.scrollBy({ left: ±slideWidth, behavior: "smooth" })`.
- Dot clicks → scroll the matching slide into view with `slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" })`.
- Keyboard: when track is focused, ArrowLeft/ArrowRight do prev/next. Home/End jump to first/last.
- Respect `prefers-reduced-motion: reduce` — replace "smooth" behavior with "auto".

STYLE (in `<style>` block, plain CSS only)
- `.carousel` margin: 0; position: relative.
- `.carousel-track` display: flex; gap: 1.5rem; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; padding-bottom: 1rem; scrollbar-width: thin; -webkit-overflow-scrolling: touch.
  - Hide native scrollbar on Webkit: `::-webkit-scrollbar { height: 6px; } ::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 999px; }`
  - On focus, show a subtle accent outline.
- `.carousel-slide` flex: 0 0 88%; max-width: 880px; scroll-snap-align: start.
  - At min-width: 720px: flex: 0 0 70%.
  - At min-width: 1100px: flex: 0 0 60%.
- `.slide-frame` background: var(--paper-deep); border: 1px solid var(--rule); border-radius: 4px; overflow: hidden.
- `.slide-frame img` width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 600ms cubic-bezier(0.2,0,0,1).
- `.slide-caption` margin-top: 0.7rem; font-family: var(--font-serif); font-style: italic; font-size: var(--text-sm); color: var(--ink-muted); line-height: 1.4; max-width: 60ch.
- `.carousel-controls` display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.25rem.
- `.carousel-btn` border: 1px solid var(--rule); background: transparent; color: var(--ink-muted); width: 2.2rem; height: 2.2rem; border-radius: 999px; display: grid; place-items: center; font-size: 1.1rem; cursor: pointer; transition: color 180ms ease, border-color 180ms ease; line-height: 1.
  - hover: color var(--ink); border-color var(--ink-muted).
  - :disabled { opacity: 0.35; cursor: default; }
  - :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
- `.carousel-dots` list-style: none; margin: 0; padding: 0; display: flex; gap: 0.5rem.
- `.carousel-dot` width: 0.45rem; height: 0.45rem; border-radius: 999px; border: 0; background: var(--ink-faint); padding: 0; cursor: pointer; transition: background 200ms ease, transform 200ms ease.
  - `.carousel-dot[aria-current="true"]` background: var(--accent); transform: scale(1.3).
  - hover: background var(--ink-muted).
- `@media (prefers-reduced-motion: reduce)` `.carousel-track { scroll-behavior: auto; }` `.slide-frame img { transition: none; }`

OUTPUT
Just the .astro file. Start with `---`, end after the closing `</style>`.
