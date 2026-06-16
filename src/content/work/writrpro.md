---
company: WritrPro
role: Creator & Solo Builder
period: "2026"
summary: A privacy-first markdown writing app and headless CMS — end-to-end encrypted notes, one-click publish to a public blog, and an editor designed to disappear.
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
    description: "Client-side E2EE — the server never sees plaintext"
  - title: Custom collections
    description: "Books, films, archive, ideas, work — one tool, many shapes"
  - title: Publish integrations
    description: "Webhook-triggered rebuilds on any frontend"
  - title: Editor sounds
    description: "Optional typewriter keys, because writing should feel tactile"
---

## The problem

<!-- TODO: replace this stub with the real case study. -->

Most writing tools force a tradeoff: either you get a distraction-free editor that's beautiful but lives in its own walled garden, or you get a CMS that publishes everywhere but feels like a database admin panel. Neither respects the rhythm of actual writing — the long focused stretches, the half-finished drafts you might never publish, the privacy of thinking on the page.

WritrPro started as a way to draft without performing. Every note is encrypted on your device before it leaves the browser, so the database holds ciphertext only. When a note is ready for the world, one click decrypts it into a separate public table and a webhook tells your blog to rebuild.

## Design decisions

### Editor first, CMS second

The editor is what you spend hours in; the CMS is what you touch for ten seconds at the end. WritrPro treats them in that order — the editor has focus mode, typewriter sounds, local grammar via Harper-via-WebAssembly, and a deliberate lack of formatting toolbars. The CMS is a single Publish Panel that lives behind a keyboard shortcut.

### End-to-end encryption that doesn't get in the way

Notes are encrypted with a key derived from the user's Clerk session. The encrypt/decrypt happens transparently — there's no key management UI, no "remember your recovery phrase" friction. The cost is that nobody (not even me, as the operator) can recover a lost account. The benefit is that "private thoughts" actually means private.

### Multi-collection from the start

A note isn't just "a blog post." It's a book review, a film note, a quote, a case study, a daily archive entry. Collections are a free-text field that the API exposes, so any consuming site can fetch posts grouped however it wants. Combined with typed `metadata` per post, this turns WritrPro into a structured CMS without sacrificing the writing experience.

## What I shipped

A production app at [writrpro.com](https://writrpro.com) with end-to-end encrypted notes, one-click publishing, webhook-triggered rebuilds, custom collections, structured metadata, and an editor people actually want to write in.

<!-- TODO: expand with the full case study — stack, timeline, hard parts. -->
