# Dependency review — 8 October 2026

## Project context

The root project is an Astro 7 portfolio deployed through the Vercel adapter.
Tailwind 4 supplies styling; React is used for the development-only DialKit
island. Most pages are prerendered. `/api/spotify.json` is the server endpoint.
Sanity content is fetched during builds, with local Markdown/MDX fallbacks.
Open Library and TMDB enrich book and film metadata. Satori and Resvg generate
social images, and Pagefind builds search indexes in both deployment and local
preview output directories.

`studio/` is an independent Sanity Studio project with its own manifest and Bun
lockfile. It contains the document schemas, Markdown editor, navigation
structure, and custom book/film autofill inputs.

## Updates

Versions were checked against the live npm registry and package peer/engine
requirements. Both projects require Node.js >=22.12.0.

| Package | Before | After | Reason |
| --- | --- | --- | --- |
| Astro | 7.0.6 | 7.3.6 | Current stable 7.x; security fixes |
| Astro MDX | 6.0.3 | 8.0.3 | Old version required Astro 6; updated version supports Astro 7.2.10+ |
| Astro Vercel | 10.0.8 | 11.0.12 | Match Astro 7 and resolve the adapter advisory |
| Astro React | 6.0.2 | 7.0.1 | Current integration; no custom Babel configuration to migrate |
| React / React DOM | Site 19.2.8; Studio 19.2.7 | 19.3.0 | Keep renderer versions aligned |
| Tailwind / Vite plugin | 4.3.2 | 4.3.3 | Patch update |
| Sanity Studio | 6.9.0 | 6.18.0 | Current stable within the existing major |
| Studio Sanity CLI | 7.5.0 | 8.14.0 | Required by the updated Sanity package |
| Studio Markdown plugin | 5.1.3 | 9.0.14 | Old plugin declared Sanity 3/4 support; updated plugin supports Sanity 6 |
| Site Sanity client | 7.23.0 | 7.27.0 | Latest within the existing major |

Also updated RSS, sitemap, fonts, React types, Marked, YAML, styled-components,
and compatible transitive dependencies. Removed the unused root Sanity CLI;
Studio retains its CLI. Declared `sharp` directly as a development dependency
because `scripts/generate-og.mjs` imports it. Declared `@sanity/ui` directly in
Studio because the custom autofill input imports it.

Retained site Motion 12, DialKit 1, Satori 0.26, and Sanity client 7. Their newer
major versions (or Satori minor series below 1.0) need separate migration work;
the final site audit reports no advisories for the retained versions.

The new Sanity CLI rejected optional access to `import.meta.env` during schema
extraction. `studio/lookups.ts` now uses the direct named environment access
recommended by the CLI, retaining the existing process-environment fallback.

## Security overrides and remaining findings

The initial audits reported 96 site advisories (including two critical) and 65
Studio advisories. Final audits report **zero site advisories** and **three
Studio advisories**. These are audit counts, not confirmed exploit paths.

The root override pins `path-to-regexp` to patched 6.3.0 because Vercel's routing
utilities still pin 6.1.0. Studio overrides pin `js-yaml` to patched 3.15.2 and
`smol-toml` to 1.9.0 because its transitive `@vercel/frameworks` package pins
older vulnerable releases. These keep the affected packages within their
existing major versions. Revisit the overrides when upstream pins are fixed.

Remaining Studio findings:

- [braces: stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
  high. Installed 3.0.3 remains the latest published release. Used by the
  code-generation watcher and pattern matching dependencies.
- [sprintf-js: unbounded precision](https://github.com/advisories/GHSA-hp3w-g68c-fv3c),
  moderate. No patched published release; comes through the CLI framework
  metadata's YAML/argparse chain.
- [uuid: missing buffer bounds checks](https://github.com/advisories/GHSA-w5hq-g745-h8pq),
  moderate. `typeid-js` requires UUID 10; the fix starts at 11.1.1. A blanket
  override would cross major versions and is deferred pending an upstream fix
  or a separately tested migration.

## Verification

- Both projects: `bun install --frozen-lockfile` passed without lockfile changes.
- Site: final `bun run build` passed, including remote image processing,
  prerendered routes, social images, Vercel output, and both Pagefind indexes.
  Each index contains 55 pages.
- Studio: final `bun run build` and schema extraction passed.
- Browser smoke check: homepage and blog detail rendered; no captured browser
  console errors on those pages, including the development React island.
- `bun outdated`: Studio has no outdated direct packages; the site only retains
  the four deliberately deferred version-series upgrades listed above.

No automated unit-test or type-check script exists in either manifest. Studio
authenticated editing/publishing and the live Spotify endpoint were not exercised.
The original site build failed in the restricted environment because remote
images could not resolve; the final network-enabled production builds passed.
Local checks ran on Node 26.7.0 and Bun 1.4.0. The Vercel adapter warned that it
selects Node 24 for serverless deployment because Node 26 is not supported there;
use Node 24 locally for closer deployment parity.

## Sources

- [Astro releases](https://github.com/withastro/astro/releases)
- [Astro React integration migration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [Sanity package upgrade guidance](https://www.sanity.io/docs/help/upgrade-packages)
- npm registry metadata and `bun audit` in each project, checked on 8 October 2026.
