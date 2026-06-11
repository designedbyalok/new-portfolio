# designedbyalok.com

Personal portfolio of Alok Kumar — Astro 6, Tailwind 4, deployed on Vercel.
Static-first: every page is prerendered except `/api/spotify.json`.

## Editing content

| Content | Source of truth | How to edit |
| :--- | :--- | :--- |
| Blog posts | [WriterPro CMS](https://writerpro.vercel.app) | Write/edit in WriterPro → redeploy (see below) |
| Work case studies | `src/content/work/*.md` | Edit frontmatter + markdown, push |
| Projects | `src/content/projects/*.md` | Edit, push |
| Books / reading | `src/content/books/*.md` | Edit, push — or `bun scripts/import-fable.ts` |
| Films / cinema | `src/content/films/*.md` | Edit, push — or `bun scripts/import-letterboxd.ts` |
| Archive (notes, quotes, models) | `src/content/archive/*.md` | Edit, push |
| Resume / About | `src/pages/resume.astro`, `src/pages/about.astro` | Edit, push |

### WriterPro → site updates

The blog is fetched from WriterPro **at build time** (`src/lib/cms.ts`). The site
is static, so publishing in WriterPro does not update the site until a new build
runs. To make WriterPro edits go live automatically:

1. In Vercel: Project → Settings → Git → **Deploy Hooks** → create a hook
   (e.g. `writerpro-publish`, branch `main`). Copy the URL.
2. Have WriterPro call that URL on publish (webhook), or just open the URL
   yourself after publishing — it triggers a rebuild.

If WriterPro is down or `CMS_API_KEY` is missing, the build **does not fail** —
it falls back to the local posts in `src/content/blog/`.

> The local MDX files in `src/content/blog/` are the offline fallback, not the
> primary source. Posts in WriterPro with the same slug win.

## Environment variables

Copy `.env.example` to `.env`. Set the same values in Vercel → Project →
Settings → Environment Variables.

- `CMS_API_KEY` — WriterPro API key (blog). **Rotate the old committed key.**
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
