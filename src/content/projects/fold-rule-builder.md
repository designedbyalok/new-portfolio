---
title: Fold Rule Builder
tagline: A visual automation canvas that lets care teams turn repeat tasks into rules — without writing code.
period: Apr 2024 — Present
role: Lead product designer, with two engineers
tags: ["Product design", "No-code", "Healthcare", "Visual editor"]
hero: https://picsum.photos/seed/rulebuilder-hero/1600/900
photos:
  - src: https://picsum.photos/seed/rulebuilder-canvas/1400/900
    caption: The canvas — branchable, undoable, keyboard-navigable.
    aspect: 14 / 9
  - src: https://picsum.photos/seed/rulebuilder-trigger/1400/900
    caption: Trigger configuration. Care-ops teams now build this themselves, in minutes.
    aspect: 14 / 9
order: 6
idea: Build a no-code rule engine that feels like a familiar diagram tool, not a developer's IDE — so a nurse manager can automate the work they used to delegate to Slack.
problem: Care-ops teams at our customer clinics were drowning in repetitive coordination — chart prep, follow-up calls, lab review nudges. They knew exactly what they wanted automated, but every existing "rule engine" we evaluated assumed the user was a developer.
solution: Designed a visual canvas around two primitives — triggers and actions — connected by simple branches. Every node has a one-line summary, so a rule reads like a sentence even when collapsed. Built it with a heavy lean on keyboard shortcuts (clinicians live on the keyboard), an undo history that survives accidental deletes, and a "preview the next 24 hours" simulator so users can see what the rule would actually do before they enable it.
whyUnique: >-
  Most no-code builders are abstractions of a developer's mental model. The
  Rule Builder starts from the clinician's mental model — events, decisions,
  follow-ups — and lets us translate that into the engine. The simulator was
  the unlock — nobody is brave enough to enable automation in a clinical
  context without seeing what happens first.
---

## How it shipped

We launched the Rule Builder in stages, starting with a small group of pilot clinics that helped us catch the half-dozen ways our mental model didn't match theirs. The biggest pivot: we'd designed for "if X then Y" and discovered that clinical work is mostly "if X then either Y or Z, depending on what the doctor flagged in the chart." Branching went from a power-user feature to the default.

By the time it was generally available, the surface had been redesigned three times — twice from observations during shadowing sessions, once from a single comment a nurse made about the verb on a button.

It's now the most-used surface in the product after the patient chart. Hundreds of rules in production. Ops teams cite it as the reason they choose Fold.
