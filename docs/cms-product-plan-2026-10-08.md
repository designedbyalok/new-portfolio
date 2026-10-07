# CMS product plan

**Content management, photo hosting, publishing, and site analytics**  
Prepared for Alok Kumar · 8 October 2026  
Status: proposed product scope and architecture; implementation has not started.

## Executive summary

Build a hosted CMS for personal websites and portfolios. Users should be able to
manage writing, work, projects, case studies, books, films, notes, and photography
in one interface, then see how their published content performs.

Use designedbyalok.com as the first production integration. Keep its Astro
frontend and replace its Sanity content layer after a verified migration. Store
media outside the website repository, expose a published-content API, and
integrate an existing analytics engine for the initial release.

The product should make common tasks approachable without requiring users to
understand document schemas. It should also support complete exports of content
and original media, so users can move away without losing their work.

The first milestone is one complete workflow:

> Sign in → write a post → upload a photo → save a draft → preview → publish →
> see it on the portfolio → inspect its performance → export the content.

## 1. Current portfolio and Sanity usage

The portfolio is an Astro 7 application with Tailwind 4, deployed through the
Vercel adapter. Most pages are prerendered; Spotify has a server endpoint.
Content is read at build time, so publishing CMS content requires a new website
build. The repository documents a Sanity webhook that triggers a Vercel deploy
hook; the external webhook configuration was not inspected for this report.

| Area | Current Sanity involvement | Existing local support |
| --- | --- | --- |
| Blog | Posts, body, dates, SEO descriptions, thumbnails | Local MDX is used when Sanity returns no posts |
| Books | Reading status, ratings, reviews, dates, quotes, covers | Local Markdown fallback; Open Library can supply missing covers |
| Films | Ratings, reviews, watch dates, directors, posters, lists | Local Markdown fallback; TMDB can enrich missing metadata |
| Archive | Notes, quotes, mental models, sources, tags | Local Markdown fallback |
| Case studies | Structured fields, body, hero images, galleries | Local records merge with Sanity; Sanity wins for matching slugs |
| Work and personal projects | Company/product details, galleries, testimonials, related studies | Local records win; Sanity adds entries not already covered locally |
| About photography | Photos, captions, alt text, aspect ratios | Placeholder photos only; no equivalent local photo collection |

These content readers also feed homepage previews, RSS, generated social images,
search, and AI profile files. Uploaded Sanity assets are served through Sanity
asset URLs, so removing CMS reads alone does not remove its image-hosting role.

Resume content, About-page text, navigation, styling, the Eye Contact experiment,
Spotify, and GitHub activity currently sit outside Sanity. The static book/film
highlights on the About page are separate from the CMS-backed collection pages.

The code includes optional Plausible tracking, enabled by `PLAUSIBLE_DOMAIN`.
Production configuration and actual analytics collection have not been verified.

## 2. Product audience and boundaries

**Initial audience:** designers, developers, writers, and other individuals who
maintain a personal website with several types of content.

**Initial product:** a hosted management interface and content API that connect
to an existing website. Website design and hosting remain separate concerns.

**First customer:** Alok's portfolio, including its current collections and
publishing workflow. Once that integration is reliable, validate onboarding with
additional users before expanding into general-purpose enterprise CMS features.

### Initial release

- User accounts, workspaces, and ownership isolation.
- Ready-made content collection templates.
- Draft editing, autosave, preview, publish/unpublish, and revision recovery.
- Media uploads, hosted images, galleries, and asset reuse.
- Published-content API and deployment webhooks.
- Site and content analytics through one provider integration.
- Portable content exports and original-media downloads.
- Backups, monitoring, recoverable deletion, and storage limits.

### Deferred

Billing, live collaborative editing, advanced team roles, arbitrary schema
builders, visual page building, AI assistance, native analytics collection,
multiple analytics providers, and scheduled publishing are later candidates.
Basic template field adjustments can be added after the fixed templates work.

## 3. Content collections and editing experience

| Collection | Fields and capabilities |
| --- | --- |
| Blog | Title, slug, body, cover, description, tags, publication date, SEO |
| Work experience | Company, role, period, summary, website, logo, body, galleries, metrics, testimonial, related case studies |
| Projects | Product name, summary, links, body, images, galleries, ordering |
| Case studies | Title, tagline, role, period, tags, problem, solution, distinctive qualities, body, galleries, related work |
| Books | Title, author, reading status, rating, dates, cover, review, quotes, notes |
| Films | Title, year, director, rating, watch date, poster, review, lists, notes |
| Archive | Title, entry type, body, source, date, tags |
| Photos | Original image, caption, alt text, aspect ratio, date, location, gallery order |

Use structured forms for metadata and a shared writing editor for long-form
content. Define the editor's canonical format before implementation. Markdown
with structured metadata is a sensible starting point for this portfolio;
advanced editor blocks must have an explicit export representation rather than
silently losing information during conversion.

Book and film autofill can reuse the existing Open Library and TMDB approaches.
Provider credentials should be managed in the CMS backend, rather than requiring
each website to handle editor-side integrations.

### Core screens

1. **Overview:** drafts, recent edits, publishing state, and site performance.
2. **Collections:** searchable lists with filters, sorting, and bulk actions.
3. **Editor:** metadata, writing, media selection, preview, revisions, publish.
4. **Media library:** uploads, captions, alt text, reuse, and usage references.
5. **Analytics:** site overview and per-content performance.
6. **Settings:** website connection, API access, webhook, analytics, exports.

## 4. Drafts, publishing, and website delivery

Editing a published item must create or update a draft without changing its live
version. Publishing promotes a validated revision into the published snapshot.
The public API reads that snapshot; authenticated preview access reads drafts.

For the Astro integration:

1. A user publishes a content revision.
2. The CMS records the published revision and queues a signed webhook.
3. The configured Vercel deployment hook requests a build.
4. Astro fetches published content and generates pages and derived outputs.
5. The CMS shows the delivery state separately from the publication state.

“Published in CMS” and “live on website” are different states. A failed website
build should show an actionable failure with retry support. Where deployment
callbacks are unavailable, show delivery as unknown rather than claiming success.

Use idempotent webhook handling, retries, and a delivery log. For build-time
content access, allow a consistent publication revision so a build does not mix
different content snapshots if another publish happens during the build.

Provide a small frontend adapter that preserves the portfolio's current content
shapes. This limits the number of page templates that need to change. Future
websites may use the same API with a different framework.

## 5. Photo hosting and media management

Repository-hosted images are workable for one small personal site, but the
multi-user CMS should store originals in object storage and keep asset metadata
in the database.

### Upload and delivery flow

1. Authenticate the upload and verify workspace ownership and quota.
2. Validate file size, detected type, and allowed formats.
3. Upload the original into controlled storage using an expiring upload grant.
4. Process thumbnails and display sizes asynchronously; record failures.
5. Store dimensions, asset status, caption, alt text, and references.
6. Serve published variants through stable delivery URLs.

Keep draft assets private. Publishing an asset for a public page makes its public
URL accessible; unpublishing cannot guarantee removal from browser or CDN caches.
Strip location metadata from public derivatives by default while preserving the
original for owner-controlled downloads. Originals need not be publicly exposed.

The library should support reusable assets and ordered galleries. Before deletion,
show which content uses the asset and protect references in published revisions.
Use a recoverable deletion period before permanently removing files.

### Proposed infrastructure

Evaluate Supabase for the initial database, authentication, and storage foundation
to reduce integration work. Supabase Storage supports row-level access policies
and signed URLs for private delivery. Evaluate transformation requirements,
quotas, operational cost, and plan availability before committing to a provider.

Keep media storage behind a provider interface. Cloudflare R2 is a possible
alternative, with an S3-compatible API; it would still require our own authorization
and image-processing workflow. Neither provider has been selected or configured.

## 6. Site analytics

Analytics belongs in the CMS dashboard, with a Performance tab on each published
content item. Start by integrating Plausible because the portfolio already has
tracking code for it. Confirm account access, API entitlement, and tracking setup
before treating this as an available production integration.

| View | Initial measurements |
| --- | --- |
| Site overview | Visitors, pageviews, traffic trend, previous-period comparison |
| Content | Views of posts, projects, case studies, and other published pages |
| Acquisition | Referrers and campaign traffic |
| Audience | Aggregate countries, devices, and browsers |
| Actions | Resume downloads, contact clicks, outbound project-link clicks |

Read aggregates through the provider's API using server-side credentials. Enforce
workspace permissions on every request, cache responses, respect rate limits,
and show the last refresh time. Distinguish missing data from zero traffic.

Track content IDs alongside page paths where supported, and retain URL history
when a slug changes. Define action names and conversion denominators consistently;
a contact-link click is an intent signal, not proof that someone sent a message.

Provide tracking installation instructions, a connection check, date filters,
clear disconnected states, and exclusions for local development and previews.
Publish timestamps can be shown as annotations without claiming that a content
change caused a traffic change. Search-engine impressions and keyword rankings
would require a separate integration and are outside the initial scope.

### Native analytics as a later phase

Owning analytics collection would require an ingestion endpoint, event validation,
bot filtering, visitor/session definitions, aggregation jobs, retention controls,
and an analytics-oriented data store. This is a separate product investment.
The initial dashboard should use a provider adapter so this option remains open.

## 7. Architecture and data model

```text
CMS management interface
          |
Authenticated application API
          |
          +-- Database: content, revisions, workspaces, references
          +-- Object storage: originals and image variants
          +-- Background jobs: media processing and webhook delivery
          +-- Analytics adapter: external aggregate metrics
          |
Published-content API / protected preview API
          |
Astro portfolio and future connected websites
```

| Entity | Purpose |
| --- | --- |
| User, Workspace, Membership | Ownership and access boundaries |
| Website | Domain, integration configuration, deployment connection |
| Collection | Template type and allowed fields |
| Content item | Stable ID, collection, slug, metadata, relationships |
| Revision | Draft/revision history and published snapshot reference |
| Asset, Asset variant | Original file, processed files, dimensions, status |
| Asset reference | Which item or revision uses a media asset |
| Publication / Delivery job | Publication version and website delivery status |
| API credential | Scoped access to published or preview content |
| Analytics connection | Provider, website mapping, protected credential reference |

Every content and asset operation must be scoped to an authorized workspace.
Validate unique slugs within the appropriate website/collection scope. Keep
credentials server-side, distinguish draft and public reads, and sanitize rendered
content. Back up the database and media separately and test restoration of both.

The framework, backend runtime, job system, and deployment platform remain open
decisions. Select them after agreeing on the data model and first workflow.

## 8. Migration from Sanity

1. **Inventory:** list documents, assets, published/draft status, slugs, and
   references. Inspect deployment hooks and determine which assets are actually
   referenced by current pages.
2. **Export:** preserve a source export and download original Sanity images.
   Maintain a mapping of Sanity document and asset IDs to new IDs.
3. **Reconcile:** compare exports with repository Markdown. Apply the current
   collection-specific precedence rules rather than assuming either source is
   universally authoritative. Identify Sanity-only content explicitly.
4. **Import:** use repeatable, idempotent imports; preserve dates, content,
   relationships, publication state, metadata, and gallery order.
5. **Integrate:** replace content readers and asset URLs through the adapter.
   Preserve existing public slugs and redirect behavior.
6. **Verify:** compare content counts, page content, images, relationships, RSS,
   search, social images, and discovery files. Test unavailable-service behavior.
7. **Cut over:** take a final export, reconcile intervening edits, enable the new
   publishing workflow, and retain a tested rollback path.
8. **Retire:** remove Sanity packages, Studio, environment variables, and hooks
   only after content and asset delivery no longer depend on Sanity.

Local fallback content does not establish that all live content has been backed
up. The photography gallery requires particular attention because its current
fallback consists of placeholder images.

## 9. Delivery phases and acceptance gates

| Phase | Deliverable | Acceptance gate |
| --- | --- | --- |
| 1. Product definition | Product spec, data model, wireframes, provider evaluation | Agree collection scope, content format, ownership rules, and publishing states |
| 2. Working vertical slice | Accounts, blog editor, uploads, draft/preview/publish, Astro adapter, export | Complete the first workflow; drafts remain private and workspace access is isolated |
| 3. Full portfolio coverage | Remaining collections, relationships, media library, revision recovery | Every current content area can be edited and delivered correctly |
| 4. Analytics | One provider connection, site overview, content performance, action events | Verify event collection and date/path filtering; empty/error states are accurate |
| 5. Migration and launch | Reconciled imports, cutover, backup/restore, operational monitoring | No lost content or broken public URLs; rollback and restoration are demonstrated |
| 6. External-user validation | Onboarding and a second website integration | Users can connect a site and publish without developer intervention for routine editing |

Phases 3 and 4 depend on the shared foundations in phase 2. A launch date or
engineering estimate should follow the product-definition phase; no staffing or
delivery commitment has been made in this report.

## 10. Open decisions and operating costs

Resolve these before implementation expands beyond the first workflow:

- Hosted service only, or a future self-hosted distribution?
- Markdown-first editing, or structured rich text with explicit export rules?
- Fixed templates initially, and how much field customization comes next?
- Website rebuild publishing initially, or additional runtime delivery modes?
- Bring-your-own analytics account, or a platform-managed analytics service?
- Media limits, original-file retention, backup policy, and quota behavior?
- Supported member roles beyond the first workspace owner?

Budget separately for application hosting, database/authentication, media storage,
image processing and delivery, background jobs, analytics, email, monitoring,
and backups. Use expected active websites, monthly traffic, media volume, and
upload frequency to evaluate cost. Provider pricing was not audited here.

## 11. Recommended next deliverables

Prepare a short implementation-ready product spec and a small set of wireframes
covering the collection list, editor, media library, preview/publish states, and
analytics dashboard. Finalize the content/revision/asset data model and API
contract. Then build the blog-and-photo workflow against the existing Astro site.

Keep the dependency maintenance changes separate from the CMS implementation
scope. Sanity retirement follows the verified migration and cutover phase.

## References

### Repository evidence

- `src/lib/sanity.ts`: queries and build-time client configuration.
- `src/lib/cms.ts`, `books.ts`, `films.ts`, `archive.ts`: fallback behavior.
- `src/lib/works.ts`, `ideas.ts`: local/remote precedence and merge behavior.
- `src/lib/photos.ts`: hosted-photo mapping and placeholder fallback.
- `studio/schemas.ts`, `studio/sanity.config.ts`: content schemas and editor setup.
- `src/layouts/Layout.astro`: optional Plausible tracking.
- `README.md`: documented publishing and deployment workflow.

### Provider documentation

- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase private-file delivery](https://supabase.com/docs/guides/storage/serving/downloads)
- [Cloudflare R2 S3-compatible API](https://developers.cloudflare.com/r2/get-started/s3/)
- [Plausible data access and Stats API](https://plausible.io/docs/data-access)
- [Plausible custom event tracking](https://plausible.io/docs/custom-event-goals)

Provider capabilities were checked against these official sources during the
planning discussion. Recommendations are proposals, not completed integrations.
