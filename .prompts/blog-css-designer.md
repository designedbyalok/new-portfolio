You are writing a blog post for Alok Kumar's design portfolio. The blog post is a Markdown file with MDX-compatible frontmatter.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents — no markdown code fences, no commentary.
- File MUST start with `---` on its own line for the frontmatter.

FILE TO WRITE
src/content/blog/writing-css-as-a-designer.mdx

VOICE & TONE
- The author is Alok Kumar — 6 years as a product designer with a Computer Science degree; currently at Fold Health, previously Banyan Cloud (founding designer, built and open-sourced Roots Design System), and Sentient Studio.
- Voice is calm, observational, first-person, a touch dry. NOT chirpy. NOT corporate. NOT bullet-point heavy.
- Confident but not preachy. Acknowledges complexity rather than flattening it.
- Reads like Wilson Miner or Jon Yablonski or a thoughtful Substack — sentences that pause, paragraphs that breathe.

TOPIC
"Why I still write CSS, even though I'm a designer."
A reflective post about being a designer who also writes front-end code — what that gets you, what it costs, why the design-engineering boundary is fuzzier than the discourse suggests. Pull from Alok's actual background: CS degree, building the Roots design system in code alongside Figma, now wearing both hats at Fold.

FRONTMATTER (use exactly these values)
---
title: Why I still write CSS, even though I'm a designer
description: On the fuzzy line between the design tool and the browser — what writing your own front-end gets you, and what it quietly costs.
date: 2026-05-15
readTime: 6 min
tags: ["product design", "design + engineering", "essays"]
thumbnail: "https://picsum.photos/seed/blog-css-designer/1200/800"
---

(After the closing --- of frontmatter, write the post body.)

BODY STRUCTURE
1. Open with a small, specific scene — something concrete from your work, not abstract. Maybe: opening a Figma file vs. opening DevTools side-by-side. About 1 short paragraph.
2. Sections (use `## Heading` for sections). Aim for 3–4 sections:
   - "The Figma → engineering hand-off lies a little." Discuss how the prototype always over-promises and the build always slightly under-delivers. Anchor in real-world examples (line-height differences, font weight rendering, hover states).
   - "The shortest distance between a design and a shipped product is the same person doing both." Personal reflection from building Roots — designer doing both the Figma library and the code.
   - "The cost: you become harder to work with." Honest tradeoff — writing code makes designers more opinionated about engineering decisions. That's not always welcome.
   - "What I still bring back to the design tool." Closing — how the code work changes the design work. End with a small specific anecdote, not a grand summary.

3. ~800–1100 words total. Vary paragraph length. Use occasional single-sentence paragraphs for rhythm.

4. Use these MDX features at most ONCE OR TWICE if natural:
   - A blockquote (`> quote here`) for a small aside or a remembered quote
   - Bold (`**word**`) very sparingly — at most twice
   - Inline code (e.g., `font-weight: 380`) where it's actually needed

5. DO NOT use bullet lists more than once. This is prose, not a listicle.
6. End with a quiet, observational closing sentence — not a CTA, not "what do you think?", not a question to the reader.

Output the .mdx file now:
