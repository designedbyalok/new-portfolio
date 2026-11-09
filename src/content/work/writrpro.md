---
company: WritrPro
kind: project
role: Creator & Solo Builder
period: "2026"
summary: A calm markdown writing app and headless CMS for web, Mac and Windows — notes encrypted at rest, one-click publish to a public blog, and an editor designed to disappear.
website: https://writrpro.com
order: 5
hero: https://picsum.photos/seed/writrpro-hero/1600/900
logo: /icon-writerpro.svg
photos:
  - src: https://picsum.photos/seed/writrpro-editor/1400/900
    caption: The distraction-free editor. Focus mode dims everything but the current sentence.
    aspect: 14 / 9
  - src: https://picsum.photos/seed/writrpro-publish/1400/900
    caption: The publish panel — slug, SEO, thumbnail, and typed metadata, all in one pass.
    aspect: 14 / 9
projects:
  - title: Encryption model
    description: "AES-GCM encryption at rest, unlocked with your account"
  - title: Custom collections
    description: "Books, films, archive, ideas, work — one tool, many shapes"
  - title: Publish integrations
    description: "Webhook-triggered rebuilds on any frontend"
  - title: Editor sounds
    description: "Optional typewriter keys, because writing should feel tactile"
---

## The problem

Most writing tools force a tradeoff: either you get a distraction-free editor that's beautiful but lives in its own walled garden, or you get a CMS that publishes everywhere but feels like a database admin panel. Neither respects the rhythm of actual writing — the long focused stretches, the half-finished drafts you might never publish, the privacy of thinking on the page.

WritrPro started as a way to draft without performing. Synced notes are encrypted at rest, so the database holds ciphertext, and they unlock with your account when you sign in. When a note is ready for the world, one click copies it into a separate public table and a webhook tells your blog to rebuild.

## Design decisions

### Editor first, CMS second

The editor is what you spend hours in; the CMS is what you touch for ten seconds at the end. WritrPro treats them in that order — the editor has focus mode, typewriter sounds, local grammar via Harper-via-WebAssembly, and a deliberate lack of formatting toolbars. The CMS is a single Publish Panel that lives behind a keyboard shortcut.

### Encryption that doesn't get in the way

Note titles and content are encrypted at rest with AES-GCM and unlocked with your account (sign-in runs on Better Auth). There's no key management UI and no "remember your recovery phrase" friction. It isn't end-to-end or zero-knowledge, and the site says so plainly rather than overclaiming. That tradeoff is what makes account recovery, search across devices and the AI features work. On a Mac you can also keep every note as a plain .md file on your own disk, and private notes never get mixed into what's published.

### Multi-collection from the start

A note isn't just "a blog post." It's a book review, a film note, a quote, a case study, a daily archive entry. Collections are a free-text field that the API exposes, so any consuming site can fetch posts grouped however it wants. Combined with typed `metadata` per post, this turns WritrPro into a structured CMS without sacrificing the writing experience.

## What I shipped

A production app at [writrpro.com](https://writrpro.com) with notes encrypted at rest, native Mac and Windows apps, one-click publishing, webhook-triggered rebuilds, custom collections, structured metadata, and an editor people actually want to write in.

