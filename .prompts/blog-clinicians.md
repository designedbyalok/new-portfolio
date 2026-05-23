You are writing a blog post for Alok Kumar's design portfolio. The blog post is a Markdown file with MDX-compatible frontmatter.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents — no markdown code fences, no commentary.
- File MUST start with `---` on its own line.

FILE TO WRITE
src/content/blog/designing-for-clinicians.mdx

VOICE & TONE
Same as the other Alok Kumar posts: calm, first-person, observational, confident-but-not-preachy. Wilson Miner / Jon Yablonski territory — sentences that pause, paragraphs that breathe. Senior designer voice, not a junior excited about UX trends.

TOPIC
"Designing for someone who doesn't have time to learn your product."
A post about designing for clinicians at Fold Health — a context where the user literally cannot tutorial, cannot read empty-state copy, cannot watch onboarding videos. The post is about how this constraint changes the design process compared to consumer or B2B SaaS.

FRONTMATTER (exact)
---
title: Designing for someone who doesn't have time to learn your product
description: Clinicians don't tutorial. Designing healthcare software taught me that real onboarding is the moment a user gets their first bit of useful work done — not before.
date: 2026-04-22
readTime: 7 min
tags: ["product design", "healthcare", "onboarding"]
thumbnail: "https://picsum.photos/seed/blog-clinicians/1200/800"
---

BODY STRUCTURE
1. Open with a concrete moment — for example, a clinician interrupting Alok during a usability session because the patient room is calling them away. Establish the constraint physically.

2. Sections (use `## Heading`). Aim for 4 sections:
   - "Onboarding doesn't happen on the onboarding screen." Argue that the real first-experience is whatever screen the user is on when they need to make a decision under time pressure. Examples: how an empty state has to be *useful*, not explanatory; how the first chart-review can't be the user's first encounter with the schema.
   - "The Figma file lies more here than anywhere else." Why static prototypes give a false sense of confidence in healthcare. The user's attention is fragmented in a way that no canvas review will catch.
   - "The instinct to add a help text is almost always wrong." Defending against the urge to over-explain. Better defaults beat better tooltips.
   - "What clinicians actually appreciate." Quiet observations about polish that this audience does notice — keyboard shortcuts, density, calm color, the absence of celebratory micro-animations.

3. ~900–1200 words. Vary rhythm. Don't be afraid of short paragraphs.

4. MDX features used sparingly:
   - One blockquote at most
   - Bold no more than twice
   - One small bulleted list IS OK if it earns its place (e.g., listing 3–4 things clinicians actually care about)
   - No headings deeper than `##`

5. End with a small reflective closing — not a CTA. Avoid words like "remember," "key takeaway," "always," "never."

Output the .mdx file now:
