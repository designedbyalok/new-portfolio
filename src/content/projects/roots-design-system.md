---
title: Roots Design System
tagline: An open-source design system for enterprise cloud security
period: Oct 2021 — Jun 2023
role: Lead designer, in collaboration with the Banyan Cloud engineering team
tags: ["Design system", "Open source", "Figma + Code", "Enterprise"]
hero: https://picsum.photos/seed/roots-hero/1600/900
photos:
  - src: https://picsum.photos/seed/roots-tokens/1400/900
    caption: The token system, generated from a single config, consumed by Figma and the React build.
    aspect: 14 / 9
  - src: https://picsum.photos/seed/roots-components/1400/900
    caption: A slice of the component library, paired with usage guidance.
    aspect: 14 / 9
external: https://zeroheight.com/390a61fea/p/195fc2-roots-design-system
order: 1
idea: A single source of truth that lives in the same shape across design tools and code — so a designer and an engineer never argue about which token is correct.
problem: At an early-stage enterprise startup, design and engineering had to ship at speed without giving up consistency. A Figma library alone goes stale the moment engineering renames a token. A component library alone leaves design drifting in Figma. We needed both, kept honest.
solution: Built Roots as paired artifacts — a Figma library and a React component library — with shared design tokens generated from one config. Documented every component with intent (when to use, when not to), states, and accessibility notes. Open-sourced it so the community could pressure-test and contribute.
whyUnique: Most design systems are documents about UI. Roots was a contract between designers and engineers — the same token names, the same component names, the same defaults, in both tools. The system shipped with usage guidance written for humans, not as a parts catalog.
---

## How it shipped

The Roots design system grew out of necessity — Banyan was shipping multiple security products in parallel and the surface area was sprawling. We made a deliberate bet to treat the design system as a product itself, with a single maintainer (me, on the design side) and a clear contribution model on engineering.

The result was a system that we could point any new designer or engineer at on day one — and that the team actually used, rather than working around.
