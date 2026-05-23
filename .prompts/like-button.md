You are writing a small Astro component.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents. No markdown fences, no commentary.
- File MUST start with `---` for Astro frontmatter (an empty frontmatter is fine).

FILE TO WRITE
src/components/LikeButton.astro

PURPOSE
A client-side like button for a blog post. No backend. Counter persists in localStorage scoped by the post slug, so refreshing or coming back later restores the user's prior likes.

API (Astro props)
- `slug: string` — required, used as the localStorage key

UX BEHAVIOR
- The button shows a heart icon and a number.
- Initial count is read from `localStorage.getItem(`like-${slug}`)`. Default 0.
- Click increments by 1 and writes back to localStorage. No upper limit, but cap visually at 99+ for display.
- The heart subtly animates on click — a quick scale pulse plus a brief color shift to var(--accent). Use a CSS keyframe.
- The button is a discrete pill — calm, not loud. Border 1px solid var(--rule), rounded-full, ink-muted color, ~text-sm. Hovers to ink + accent border.
- Liked state (count > 0): the heart fills with var(--accent), and stays filled.

DESIGN TOKENS AVAILABLE
--paper, --paper-deep, --ink, --ink-muted, --ink-faint, --rule, --accent, --accent-soft
--font-sans, --font-serif, --text-xs, --text-sm, --text-base

LAYOUT
The button itself, with optional aria-label="Like this post". The component returns ONLY the button (caller wraps it).

CODE STRUCTURE
- Frontmatter: declare Props (`{ slug: string }`) and pull from Astro.props.
- Markup: a single `<button class="like-button" data-slug={slug} aria-label="Like this post">` containing:
  - An inline SVG heart (24x24, stroke currentColor, with a class on the path so it can be filled when liked).
  - A `<span class="like-count">0</span>` for the count display.
- A `<script>` block (NOT `is:inline`) that:
  - On load and on `astro:after-swap`, finds all `[data-slug]` like-buttons that haven't been bound (use `data-bound` flag).
  - Reads the count from localStorage, updates the displayed count, and sets `.is-liked` class if count > 0.
  - On click: increment, persist, update display, add `.just-clicked` class for the pulse animation, remove it after 380ms.
- A `<style>` block with:
  - `.like-button` styles
  - `.like-button:hover`
  - `.like-button.is-liked .heart` (filled with accent)
  - `.like-button.just-clicked .heart` (keyframe pulse animation)
  - `.like-count` styles
  - Use `var(--accent)`, `var(--rule)`, etc.

Output the .astro file now:
