# Instructions for Qwen3: Rework the Homepage Hero — Paper Grain + Component Refactor

We are replacing the homepage's interactive orb canvas (currently in `src/pages/index.astro`) with a quieter, more editorial composition:

1. A new `HeroGrain` component — a slow-drifting paper-grain canvas, no cursor tracking.
2. A new `KineticLead` component — which is being authored in parallel by another model; you do NOT write that file, you only import and use it.

Your job is THREE concrete tasks below. Follow them exactly. The result must compile cleanly with Astro 5 + TypeScript and match the editorial restraint of the rest of the site (light-warm sepia / dark-ash cool, no flashy effects).

---

## CONTEXT YOU CAN ASSUME

- Site stack: Astro 5 + Tailwind v4 + custom CSS variables.
- Light theme paper: `#faf8f4`; dark theme paper: `#0e0d0b`. Available CSS vars: `--paper`, `--paper-deep`, `--ink`, `--ink-muted`, `--ink-faint`, `--rule`, `--accent`, `--accent-soft`.
- Theme is toggled via `document.documentElement.getAttribute('data-theme') === 'dark'`, with a system-pref fallback when the attribute is absent: `window.matchMedia('(prefers-color-scheme: dark)').matches`.
- Astro View Transitions are enabled (`ClientRouter` in `src/layouts/Layout.astro`). Any canvas/animation must rebind on `astro:after-swap` and clean up on `astro:before-swap`.

## INTEGRATION CONTRACT FOR KineticLead (do NOT change)

You do not write this file. The other model is creating `src/components/KineticLead.astro` with this exact public surface:

- Path: `src/components/KineticLead.astro`
- Usage: `<KineticLead />` (no props)
- Renders, at the top level: a `<section class="lead" aria-label="Lead statement">` containing the existing lead paragraph and `.lead-meta` paragraph from today's `index.astro`. The `.lead` and `.lead-meta` outer styles are PRESERVED in `index.astro`; the KineticLead component owns only the kinetic letter spans inside.

You can safely import it and render it; if the other model has not finished yet, the dev server will warn but the rest of the page should still compile.

---

## TASK 1 — Create `src/components/HeroGrain.astro`

Replace the entire contents of (or create) `src/components/HeroGrain.astro` with the following clean, robust implementation. The grain field is procedural noise drawn onto an offscreen tile that drifts diagonally; we draw the tile twice with subtle offset to fake low-frequency motion. No cursor tracking, no orbs, no gradient blobs.

```astro
---
interface Props {
  /** Opacity ceiling in light theme. Default 0.06. */
  lightOpacity?: number;
  /** Opacity ceiling in dark theme. Default 0.10. */
  darkOpacity?: number;
}

const { lightOpacity = 0.06, darkOpacity = 0.10 } = Astro.props;
---

<canvas
  class="hero-grain"
  data-light-opacity={lightOpacity}
  data-dark-opacity={darkOpacity}
  aria-hidden="true"
></canvas>

<style>
  .hero-grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  :global(:root[data-theme="dark"]) .hero-grain {
    mix-blend-mode: screen;
  }

  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme="light"])) .hero-grain {
      mix-blend-mode: screen;
    }
  }
</style>

<script>
  interface GrainState {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    tile: HTMLCanvasElement;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    rafId: number;
    lastRegenAt: number;
    lightOpacity: number;
    darkOpacity: number;
  }

  const TILE_SIZE = 256;
  const REGEN_INTERVAL_MS = 1400;

  function isDarkMode(): boolean {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function buildTile(dark: boolean): HTMLCanvasElement {
    const tile = document.createElement("canvas");
    tile.width = TILE_SIZE;
    tile.height = TILE_SIZE;
    const tctx = tile.getContext("2d");
    if (!tctx) return tile;

    const imgData = tctx.createImageData(TILE_SIZE, TILE_SIZE);
    const data = imgData.data;

    // Warm sepia grain in light, cool ash in dark.
    // Light: paper #faf8f4 = (250,248,244). Subtract small amount toward (210,196,178).
    // Dark : paper #0e0d0b = (14,13,11).   Add small amount toward (190,180,170).
    for (let i = 0; i < data.length; i += 4) {
      const n = Math.random();
      if (dark) {
        // Ash highlight on dark paper. Use screen blend in CSS.
        const v = Math.floor(180 + n * 60);
        data[i] = v;        // R
        data[i + 1] = v - 8; // G (slightly cooler)
        data[i + 2] = v - 14; // B
        data[i + 3] = Math.floor(n * 110); // sparse alpha
      } else {
        // Sepia shadow on warm paper. Use multiply blend in CSS.
        const v = Math.floor(160 + n * 80);
        data[i] = v;        // R
        data[i + 1] = v - 12; // G
        data[i + 2] = v - 24; // B (warmer)
        data[i + 3] = Math.floor(n * 90);
      }
    }
    tctx.putImageData(imgData, 0, 0);
    return tile;
  }

  function initHeroGrain() {
    const canvas = document.querySelector(".hero-grain") as HTMLCanvasElement | null;
    if (!canvas) return;
    if (canvas.getAttribute("data-bound") === "true") return;
    canvas.setAttribute("data-bound", "true");

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lightOpacity = parseFloat(canvas.dataset.lightOpacity ?? "0.06");
    const darkOpacity = parseFloat(canvas.dataset.darkOpacity ?? "0.10");

    const state: GrainState = {
      canvas,
      ctx,
      tile: buildTile(isDarkMode()),
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
      rafId: 0,
      lastRegenAt: performance.now(),
      lightOpacity,
      darkOpacity,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const onThemeChange = () => {
      state.tile = buildTile(isDarkMode());
    };
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    systemDark.addEventListener("change", onThemeChange);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const drawTiled = () => {
      ctx.globalAlpha = isDarkMode() ? state.darkOpacity : state.lightOpacity;
      const startX = -(((state.offsetX % TILE_SIZE) + TILE_SIZE) % TILE_SIZE);
      const startY = -(((state.offsetY % TILE_SIZE) + TILE_SIZE) % TILE_SIZE);
      for (let y = startY; y < state.height; y += TILE_SIZE) {
        for (let x = startX; x < state.width; x += TILE_SIZE) {
          ctx.drawImage(state.tile, x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      ctx.clearRect(0, 0, state.width, state.height);

      if (!prefersReducedMotion.matches) {
        state.offsetX += 0.12; // very slow diagonal drift
        state.offsetY += 0.07;
      }

      // Periodically regenerate the tile so the grain doesn't tile-pattern
      // visibly over time.
      if (!prefersReducedMotion.matches && now - state.lastRegenAt > REGEN_INTERVAL_MS) {
        state.tile = buildTile(isDarkMode());
        state.lastRegenAt = now;
      }

      drawTiled();

      if (!prefersReducedMotion.matches) {
        state.rafId = requestAnimationFrame(frame);
      }
    };

    state.rafId = requestAnimationFrame(frame);
    if (prefersReducedMotion.matches) {
      // Draw once and stop.
      drawTiled();
    }

    const cleanup = () => {
      cancelAnimationFrame(state.rafId);
      window.removeEventListener("resize", onResize);
      systemDark.removeEventListener("change", onThemeChange);
      themeObserver.disconnect();
    };

    document.addEventListener("astro:before-swap", cleanup, { once: true });
  }

  initHeroGrain();
  document.addEventListener("astro:after-swap", initHeroGrain);
</script>
```

Notes for you (Qwen):
- Do NOT add `is:inline` to the `<script>` block — it must be Astro-processed so TypeScript compiles.
- Do NOT add `<canvas id="hero-canvas">` — the class `.hero-grain` is the only hook.
- Keep `mix-blend-mode: multiply` for light and `screen` for dark — this matches the existing palette ethos in `src/pages/index.astro`.

---

## TASK 2 — Refactor `src/pages/index.astro`

You will modify the existing file. Read it first to confirm structure. Then make these EXACT changes:

1. **Add imports** at the top of the frontmatter, just below `import Layout from "../layouts/Layout.astro";`:
   ```astro
   import HeroGrain from "../components/HeroGrain.astro";
   import KineticLead from "../components/KineticLead.astro";
   ```

2. **Replace the canvas element.** Find the line `<canvas id="hero-canvas"></canvas>` (currently inside `<div class="container-edge container-content landing">`) and replace it with:
   ```astro
   <HeroGrain />
   ```

3. **Replace the lead section.** Find the entire block:
   ```astro
   <section class="lead" aria-label="Lead statement">
     <p class="display display-lg text-balance animate-fade-in">
       Alok Kumar designs at Fold Health — building
       <span class="display-italic">Primary and Chronic Care</span>
       for clinicians and patients.
     </p>
     <p class="lead-meta animate-fade-in-delayed">
       Pune, Maharashtra · Six years at the intersection of design and engineering.
     </p>
   </section>
   ```
   Replace it with:
   ```astro
   <KineticLead />
   ```

4. **Delete the entire `<script>` block** at the bottom of `src/pages/index.astro` (the one that defines `initHeroCanvas`, the `Orb` interface, the orb drawing, etc.). It begins with `<script>` and ends with `</script>` — remove the whole block, including its opening and closing tags. There must be no `<script>` block left in `index.astro` after this step.

5. **In the `<style>` block, DELETE these rules** (and only these — leave everything else intact):
   - `#hero-canvas { ... }` (the absolute-positioned canvas rule)
   - `:root[data-theme="dark"] #hero-canvas { ... }`
   - `.animate-fade-in { ... }`
   - `.animate-fade-in-delayed { ... }`
   - `@keyframes reveal { ... }`

6. **KEEP these rules** in the `<style>` block exactly as they are today (DO NOT delete):
   - `.landing { ... }` (with its `position: relative` and padding-block)
   - `.lead, .block { position: relative; z-index: 10; }` — but trim this selector to just `.block { position: relative; z-index: 10; }` since `.lead` is now owned by the KineticLead component. The component renders its own `.lead` section; we no longer need the rule on this page.
   - `.lead { max-width: 32ch; }` and the `@media (min-width: 720px)` / `@media (min-width: 1100px)` rules for `.lead` — **KEEP these**. They style the wrapping section element that KineticLead renders.
   - `.lead-meta { ... }` — **KEEP**. Same reason.
   - `.block`, `.block-list`, `.block-list li`, `.block-list li + li`, `.links-row`, `.links-row span[aria-hidden]`, `.read-list`, `.read-link`, `.read-list li:last-child .read-link`, `.read-link .arrow`, `.read-link:hover`, `.read-link:hover .arrow` — all KEPT, unchanged.

7. **Verify final state.** After your edits, `src/pages/index.astro` should:
   - Have three imports in the frontmatter: `Layout`, `HeroGrain`, `KineticLead`.
   - Inside `<div class="container-edge container-content landing">`, the children should be (in order): `<HeroGrain />`, `<KineticLead />`, then the three existing `<section class="block">` blocks (Currently, Find me, Read on) — totally unchanged.
   - Have NO `<script>` block.
   - Have a `<style>` block with `.landing`, `.lead`, `.lead-meta`, `.block`, `.block-list`, `.links-row`, `.read-list`, `.read-link` rules and the related media queries.

---

## TASK 3 — Self-check

Before finishing, mentally compile the file:
- Astro frontmatter imports resolve to existing or in-flight files (`KineticLead.astro` may not yet exist when you finish; that is fine — the other model is creating it in parallel and the build will catch it once both land).
- No leftover references to `#hero-canvas`, no leftover `initHeroCanvas`, no leftover `Orb` interface.
- No leftover `animate-fade-in` class usages (the KineticLead component does not need them; the new design relies on grain motion and kinetic letterforms for life).
- The three `<section class="block">` blocks for Currently / Find me / Read on are byte-for-byte identical to today.

If you find ambiguity, prefer the smaller, more conservative edit. Do not refactor styles you were not told to touch. Do not rename classes. Do not add new dependencies.

End of instructions.
