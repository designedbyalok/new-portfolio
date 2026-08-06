# designedbyalok.com

Personal portfolio of Alok Kumar — Astro 6, Tailwind 4, deployed on Vercel.
Static-first: every page is prerendered except `/api/spotify.json`.

## Editing content

| Content | Source of truth | How to edit |
| :--- | :--- | :--- |
| Blog posts | [Sanity Studio](https://designedbyalok.sanity.studio) | Write/edit in Studio → Publish (auto-redeploys, see below) |
| Books / reading | Sanity Studio | Edit in Studio, or `bun scripts/import-fable.ts` into `src/content/books/*.md` |
| Films / cinema | Sanity Studio | Edit in Studio, or `bun scripts/import-letterboxd.ts` into `src/content/films/*.md` |
| Books / films / archive / photos (local fallback) | `src/content/**/*.md` | Edit, push — used when Sanity is empty/unreachable |
| Work case studies | `src/content/work/*.md` | Edit frontmatter + markdown, push |
| Projects | `src/content/projects/*.md` | Edit, push |
| Resume / About | `src/pages/resume.astro`, `src/pages/about.astro` | Edit, push |

### Sanity → site updates

Content is fetched from Sanity **at build time** (`src/lib/sanity.ts`, consumed
by `src/lib/cms.ts` and the per-collection libs). The site is static, so
publishing in Studio does not update the site until a new build runs — which is
automatic: a Sanity GROQ webhook (filter `!(_id in path("drafts.**"))`) calls a
Vercel Deploy Hook on every publish, so a change is live ~1–2 min later.

If Sanity is empty or unreachable, the build **does not fail** — each section
falls back to its local MDX in `src/content/`. Sanity documents with the same
slug win over the local fallback.

## Environment variables

Copy `.env.example` to `.env`. Set the same values in Vercel → Project →
Settings → Environment Variables.

- `SANITY_PROJECT_ID` / `SANITY_DATASET` — the content source. Without
  `SANITY_PROJECT_ID` the client is disabled and every section uses its local
  MDX fallback. `SANITY_TOKEN` is only needed to read drafts (preview builds).
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REFRESH_TOKEN` —
  power the "Listening to…" card (see `docs/spotify-setup.md`). Optional:
  without them the card shows a quiet offline state.
- `LETTERBOXD_USERNAME`, `FABLE_USERNAME` — only used by the manual import
  scripts; never used at build/runtime.
- `PLAUSIBLE_DOMAIN` — set (e.g. `www.designedbyalok.com`) to enable
  privacy-first analytics. Unset = no analytics script at all.

## Commands

| Command | Action |
| :--- | :--- |
| `bun install` | Install dependencies |
| `bun dev` | Dev server at `localhost:4321` (search is disabled in dev) |
| `bun run build` | Build to `./dist/` + generate the Pagefind search index |
| `bun preview` | Preview the production build (search works here) |
| `bun scripts/generate-og.mjs` | Regenerate the default social share image |

## Discovery

The site exposes `/rss.xml`, `/sitemap-index.xml`, `/llms.txt` (machine-readable
site map for AI agents) and `/ai.txt` (plain-text profile). These build from the
content collections — they update themselves when content changes.
