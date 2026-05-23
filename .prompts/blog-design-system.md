You are writing a blog post for Alok Kumar's design portfolio. The blog post is a Markdown file with MDX-compatible frontmatter.

CRITICAL OUTPUT RULES
- Output ONLY the raw file contents — no markdown code fences, no commentary.
- File MUST start with `---` on its own line.

FILE TO WRITE
src/content/blog/lessons-from-roots.mdx

VOICE & TONE
Same as other Alok Kumar posts — calm, observational, first-person, dry humor allowed, no corporate clichés, no boosterism. Senior voice that takes its time.

TOPIC
"What two years of maintaining an open-source design system taught me."
A reflective post about building and open-sourcing the Roots design system at Banyan Cloud (founding designer role, 2021–2023). Specifically about what doesn't get said in design-system talks at conferences — the slow parts, the maintenance, the difference between adoption and use, the tax of changing one component.

FRONTMATTER (exact)
---
title: What two years of maintaining an open-source design system taught me
description: Building Roots was the easy part. Living with it was the education — and the part the conference talks tend to skip.
date: 2026-03-04
readTime: 8 min
tags: ["design systems", "product design", "open source"]
thumbnail: "https://picsum.photos/seed/blog-design-system/1200/800"
---

BODY STRUCTURE
1. Open with a specific moment — for example, the first time a developer outside the company opened a PR against Roots, and what that felt like.

2. Sections (use `## Heading`). Aim for 4–5 sections:
   - "There is a difference between adoption and use." Many products said they were on Roots; few of their screens proved it. Talk about how to detect this honestly.
   - "Every change is a six-week change." A component update lands in code in a day. Getting it into every product surface takes weeks. Talk about the discipline of patience and the tooling that helped (and didn't).
   - "Documentation that matches the code drifts the day you ship it." Honest tradeoffs in keeping the design tool, the code, and the docs in sync. Mention the tooling decisions and which ones survived.
   - "The hardest review is your own past self." Going back to components built in year one — the choices that look obviously wrong now but were correct at the time.
   - "Why open-sourcing was worth it anyway." Closing argument — not a victory lap, but a quiet case for the discipline that comes from publishing.

3. ~1000–1300 words. Long-form is appropriate here.

4. Allow these MDX features ONCE EACH if natural:
   - A blockquote (a quoted observation from a teammate, real-or-imagined)
   - One inline code reference (e.g., `<Button>`)
   - One short bulleted list

5. End with a quiet, slightly self-effacing closing line. Not a "follow me on Twitter," not a question.

Output the .mdx file now:
