# designedbyalok.com

Personal portfolio of Alok Kumar — Astro 7, Tailwind 4, deployed on Vercel.
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

### Mantel

When `MANTEL_CONTENT_URL` is set, every content reader (`src/lib/*.ts`) reads
Mantel's published snapshot first (`src/lib/mantel.ts`), mapped into the same
`CMSPost` shapes (`src/lib/mantel-map.ts`), so pages don't change. If Mantel is
set and reachable it is the only source, so an unpublished piece can't come back
from Sanity or local files. If it can't be reached, the build warns and falls
back to Sanity and local MDX as above. `MANTEL_REVISION` pins a build to one
snapshot. `MANTEL_PREVIEW=1` (with `MANTEL_PREVIEW_SECRET`) builds from drafts
for a local look; never deploy that build. Archived pieces are left out for now.

All content Markdown renders through `src/lib/markdown.ts`: raw HTML is limited
to an allowed set of tags and attributes, and links and images must use safe
protocols. Plain Markdown renders exactly as `marked`'s defaults.

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
- `MANTEL_CONTENT_URL`, `MANTEL_REVISION`, `MANTEL_PREVIEW_SECRET`,
  `MANTEL_PREVIEW` — Mantel as the content source (see above). Mantel writes the
  first three onto the Vercel project when the site is connected.
- `PLAUSIBLE_DOMAIN` — set (e.g. `www.designedbyalok.com`) to enable
  privacy-first analytics. Unset = no analytics script at all.

## Commands

| Command | Action |
| :--- | :--- |
| `bun install --frozen-lockfile` | Install the locked site dependencies |
| `cd studio && bun install --frozen-lockfile` | Install the locked Studio dependencies |
| `cd studio && bun run build` | Build Sanity Studio |
| `bun dev` | Dev server at `localhost:4321` (search is disabled in dev) |
| `bun run build` | Build to `./dist/` + generate the Pagefind search index |
| `bun preview` | Preview the production build (search works here) |
| `bun run test` | Mantel mapping and safe Markdown tests |
| `bun scripts/generate-og.mjs` | Regenerate the default social share image |

## Discovery

The site exposes `/rss.xml`, `/sitemap-index.xml`, `/llms.txt` (machine-readable
site map for AI agents) and `/ai.txt` (plain-text profile). These build from the
content collections — they update themselves when content changes.

## Dependency maintenance

The site and `studio/` are separate Bun projects with separate lockfiles. Both
require Node.js 22.12 or newer. Run `bun outdated` and `bun audit` in each
directory, check framework/plugin peer requirements before major upgrades, and
commit both updated lockfiles alongside their manifests. Validate each with
`bun install --frozen-lockfile` and `bun run build`. The site build needs network
access for remote images and configured content services.

See [the October 2026 dependency review](docs/dependency-review-2026-10-08.md)
for update decisions, security overrides, and remaining Studio advisories.
