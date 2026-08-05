---
title: Cloud Posture Canvas
tagline: A visual map of a customer's cloud-security posture — designed so a CISO could see the problem in fifteen seconds.
period: Jan 2022 — Sep 2022
role: Lead designer, in close collaboration with the runtime-protection engineering team at Banyan Cloud
tags: ["Product design", "Data visualization", "Enterprise security"]
hero: https://picsum.photos/seed/posture-hero/1600/900
photos:
  - src: https://picsum.photos/seed/posture-map/1400/900
    caption: The posture canvas — every node a resource, every edge a relationship.
    aspect: 14 / 9
  - src: https://picsum.photos/seed/posture-detail/1400/900
    caption: A drill-down on a single resource, with the remediation path highlighted.
    aspect: 14 / 9
order: 7
idea: Show a security posture as a map you can read at a glance — not a table of findings ten thousand rows long.
problem: Enterprise security tools default to lists. A typical posture-management product gives a CISO a CSV with thousands of "findings" and asks them to prioritize. The information density is right; the legibility is wrong. The result is a tool nobody opens between audits.
solution: Built a force-directed layout where every node is a cloud resource and every edge is a trust relationship. Findings live as colored halos on the nodes — saturation by severity, count by halo thickness. A panel on the right surfaces the same data as a sorted list for power users, but the canvas is the first thing you see. The whole thing renders client-side and stays responsive at ten thousand nodes.
whyUnique: Most security tools optimize for completeness. This one optimized for the first fifteen seconds — what does a CISO see when they open this on a Monday morning? The drilldown is rigorous, but the entry point is calm.
---

## How it shipped

The canvas was almost cut twice. Early reviewers — security engineers, mostly — wanted the list, not the map. The breakthrough came when we showed it to a non-engineer executive who pointed at the largest red halo and said "that's the one." Nobody had ever done that with the CSV.

We kept the list. We just put the canvas first.
