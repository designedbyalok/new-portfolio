---
title: Worklists
tagline: "A family of care-management queues — one system, six workflows — so every care program feels purpose-built without fragmenting the product."
period: "2026"
role: "Product design — systems design, IA, interaction design, design-system stewardship"
tags: ["Product design", "Systems design", "Healthcare", "Enterprise"]
external: https://fold.health
order: 3
idea: "One shared shell and interaction grammar, one patient identity, one deduplicated roster — and a dedicated, purpose-built table for every care program."
problem: "Six care programs need genuinely different work surfaces: TOC runs on countdown timers and acuity, HCC on a review pipeline, CCM on billable minutes, HEDIS on quality-gap statuses. A single configurable mega-table serves each program its own work wrapped in five programs' clutter, and shipping slows as every new program negotiates against every existing layout. Six unrelated tables are worse — users who work across programs pay a re-learning tax at every switch. Meanwhile the All Patients count was computed by adding list lengths, so patients in multiple programs were counted twice and newer programs not at all."
solution: "A layered system with the boundary written down: navigation, shell, interaction grammar and primitives are singular; tables, columns, statuses and row actions are sovereign per program. Two anchors never move — patient identity pinned left, actions pinned right — so spatial habits survive every switch. Filters converged on one chip component app-wide. Fold ID became the single patient identifier, All Patients a true deduplicated union, and patient URLs carry their source list so back-navigation returns you to the queue you were working."
whyUnique: "It inverts the usual DRY instinct on purpose — duplication at the table layer is accepted so each program fits its workflow exactly while the shared shell stays small enough to be genuinely universal. Consistency was treated as a direction of travel rather than a launch gate: lists shipped fast, then converged through deliberate consolidation passes working with settled requirements instead of guesses. The bet was validated four times, as CCM, AWV, HEDIS and SNP each composed from the shell in days."
---

| | |
|---|---|
| **Product** | Fold Health — care-orchestration platform for value-based care |
| **Feature** | The Population workspace: All Patients roster + program worklists (TOC, HCC, CCM, AWV, HEDIS, SNP), agent queue, scheduling list |
| **Role** | Product design — systems design, IA, interaction design, design-system stewardship |
| **Users** | Care managers, coordinators, coders, outreach staff, program leads |

---

## Overview

Almost everything a care team does at Fold starts from a **worklist**: a queue of patients who need something — a post-discharge call within 48 hours, a chronic-care check-in, an annual wellness visit, a quality-measure gap closed, a diagnosis reviewed for risk adjustment. The Population workspace is where all of those queues live, side by side, under one navigation.

The design challenge wasn't any single list. It was the *family*. Each care program has genuinely different work: Transitions of Care (TOC) runs on countdown timers and acuity scores; HCC coding runs on a multi-stage review pipeline; Chronic Care Management (CCM) runs on billable minutes and CPT thresholds; HEDIS runs on quality-measure gap statuses. A patient can appear in several of these at once.

So the real brief was a systems question:

> How do you give six different workflows the specialized tables they each deserve, while keeping them recognizably one product — same navigation, same interactions, same patient identity — and while showing the team one truthful view of their whole population?

The answer became a layered system: **one shared shell and interaction grammar, one patient identity, one deduplicated roster — and a dedicated, purpose-built table for every program.**

---

## Problem

### One table can't serve six masters

The tempting architecture — and the first instinct — is a single configurable patient table with per-program columns. It fails in practice, and it fails slowly:

- **The columns don't overlap where it matters.** TOC's core columns (LACE acuity, outreach window countdown, call-attempt history) are meaningless to a coder; HCC's pipeline-stage columns are noise to an outreach nurse; CCM's billable-minutes tracker belongs nowhere else. A generic table serves each program its own work wrapped in five programs' clutter.
- **Row actions diverge even faster than columns.** Opening a diagnosis review panel, logging a call attempt, reviewing billing time, closing a care gap — each program's primary row action is different, and each deserves the prime position.
- **The mega-table becomes nobody's product.** Every new program's needs get negotiated against every existing program's layout. Shipping slows, and the shared thing drifts toward the lowest common denominator.

### But six unrelated tables are worse

The opposite failure was already visible in early builds: each list growing its own header, its own filter row, its own badge styles, its own selection model. Users who worked across programs (most of them) paid a re-learning tax at every switch, and every visual inconsistency read as a bug.

### And the population math was quietly wrong

The "All Patients" count — the number leadership actually quotes — was computed by adding list lengths. Patients enrolled in multiple programs were counted multiple times; newer programs weren't counted at all. Alongside that, patients had different identifiers in different lists, so the same human being couldn't be reliably followed from a TOC row to an HCC record to their profile.

---

## Goal

- **Per-program fit.** Each worklist shows exactly the columns, statuses, filters, and actions its workflow needs — nothing borrowed, nothing negotiated away.
- **One grammar.** Search, filter, sort, select, bulk-act, paginate, and open-a-patient behave identically everywhere. Learn one list, know them all.
- **One patient.** A single identity (the Fold ID) and a single profile destination, no matter which list you arrived from — with navigation that remembers your path.
- **One honest number.** All Patients is a real deduplicated union of every program's population, not an arithmetic accident.
- **Cheap growth.** A new care program's worklist should be days of composition, not weeks of negotiation.

---

## Process

### 1. Study the work, not the table

Each program's list was designed from its workflow backwards. What does the user do with a row? For TOC, the row is a *deadline* — the design centers a countdown ("TOC 48h") and acuity, because the job is triage-by-urgency. For HCC, the row is a *record in a pipeline* — the design centers per-stage progress and due dates. For CCM, the row is a *meter* — minutes accumulated toward a billable threshold. Same table anatomy, completely different centers of gravity. Writing these "row = ?" statements first kept every later column debate short.

### 2. Draw the line between shared and specific

The system was deliberately split into layers:

| Layer | What lives there | Shared? |
|---|---|---|
| **Navigation** | Population sub-nav: All Patients, shared lists, agent queue, scheduling — each with a live count | ✅ One |
| **Shell** | Header with title + search/filter/history/export, filter-chip row, sticky-column table frame, bulk bar, pagination, loading skeletons, empty states | ✅ One |
| **Grammar** | Selection model, filter-chip behavior, sort behavior, saved filters, row hover, quick view vs. full profile | ✅ One |
| **Primitives** | Avatars, badges, chips, buttons, drawers — the design-system vocabulary | ✅ One |
| **Table & row** | Columns, statuses, row actions, program drawers | ❌ Per program, on purpose |

The rule that made it stick: **share the chrome and the grammar, never the table.** Each worklist owns its own table and row components outright — a deliberately anti-DRY decision at the table layer, so that specialization stays cheap and the shared shell stays small enough to be truly universal.

### 3. Converge iteratively, in production

The family wasn't born consistent; it was *made* consistent through deliberate consolidation passes once the per-program shapes settled: every list migrated onto the shared shell, then onto one shared filter bar and chip component, then onto one shared section header, then onto shared badge sizing and iconography, then through an accessibility pass (WCAG AA). Each pass removed a hand-rolled variant somewhere. Consistency was treated as a direction of travel, not a launch gate — which let individual programs ship fast early without permanently forking the experience.

---

## The System

### The Population workspace

A left sub-nav lists the population views — **All Patients** at the top, then the program worklists (TOC, HCC, CCM, AWV, HEDIS, SNP), the AI **agent queue**, and a **scheduling list** — each with a live patient count. The counts aren't decoration; they're the team's morning triage: where is the work today?

### The shared shell

Every worklist renders inside the same frame: title on the left; search (expanding in place from an icon), filter toggle, history, and export on the right; an optional row of filter chips; the table; a floating bulk-action bar that appears when rows are selected; pagination. Wide tables scroll horizontally while two things never move — the **patient column pinned left** (with its checkbox) and the **actions column pinned right**. Whatever the program, your anchors are always in the same place: *who* on the left, *what you can do* on the right.

### The worklists themselves

- **TOC (Transitions of Care)** — the urgency queue. LACE acuity, an outreach-window countdown (48-hour / 7-day), outreach status, call-attempt history as dot indicators, next-outreach date, and the assigned AI agent. Viewable sorted by urgency or grouped by lifecycle stage (Ongoing Call, In Queue, Scheduled, Needs Attention, Enrolled).
- **HCC (risk-adjustment coding)** — the pipeline queue: RAF score with uplift chip, open-diagnosis counts, per-stage review columns, due dates with overdue chips. (Covered in depth in its own case study.)
- **CCM (Chronic Care Management)** — the time-and-billing queue: billable minutes against CPT thresholds, a time-range filter, and a billing-review drawer.
- **AWV (Annual Wellness Visits)** — the scheduling-compliance queue for yearly visits.
- **HEDIS** — the quality queue: care-gap status badges with a canonical status vocabulary, and a care-gap drawer with its own activity log and outreach tab.
- **SNP (Special Needs Plans)** — program status and sub-status tracking for SNP members.

Each has its own table, its own row, its own store slice and persistence — and every one of them *feels* like the others.

### One patient, everywhere

- **Fold ID** was unified as the single patient identifier across every list and the profile (with collision handling), replacing the mixed per-source IDs.
- **All Patients** computes its roster as a true deduplicated union across every worklist — normalize each row's member ID, merge, count once. A patient in three programs is one person, once.
- **Continuity of navigation:** opening a patient from any list produces a URL carrying the source list, and the breadcrumb reads *Population → \<list\> → Patient* — so back-navigation returns you to the queue you were working, with deep links that preserve that context when shared.

---

## Workflow

A care manager's day through the system:

1. **Scan the sub-nav counts** — which queues grew overnight?
2. **Enter a worklist** — rows are already ordered by what that program means by "urgent" (countdown, due date, threshold).
3. **Narrow** — filter chips (gender, language, acuity, status, assignee, outreach window…) with the app-standard chip behavior; save a filter set you use daily and it's there tomorrow, shareable with the team.
4. **Triage a row** — hover for instant context (the age shows its full DOB in a tooltip; statuses explain themselves); open a **quick view** for a glance, or continue into the **full profile** when the patient becomes the task.
5. **Act** — the sticky actions column carries the program's primary verbs: open the diagnosis panel, log the call, review billing time, close the gap.
6. **Act in bulk** — checkbox selection (with select-all and indeterminate states) floats up the bulk bar for batch assignment and batch actions.
7. **Return** — the breadcrumb and source-aware URL put you back exactly where you left the queue.

---

## Key Design Decisions

### 1. Dedicated tables, shared everything-else

The defining call. Each worklist owns its table and row outright; the shell, primitives, and interaction grammar are shared and singular. This inverted the usual DRY instinct — duplication at the table layer was accepted *on purpose* to protect two things: each program's ability to fit its workflow exactly, and the shared shell's ability to stay simple. The test of the decision came with each new program (CCM, AWV, HEDIS, SNP): every one composed its list from the shell in days, mirroring the structure of its siblings without inheriting their compromises.

### 2. Make "who" and "do" immovable

Program tables vary wildly in width and content, so the design fixed the two universal anchors: patient identity pinned left, actions pinned right, everything program-specific scrolling between them. Users switching between programs keep their spatial habits; the checkbox, the patient, and the primary action are always where the hand expects them.

### 3. One filter language, chip by chip

Filters converged on a single chip component and bar across the entire app: an inactive chip reads `Label ⌄`, an active one reads `Label : Value ✕`, options open in a consistent popover, and saved filter sets ride along. This was enforced as a hard rule (legacy filter UI gets migrated on touch) because filtering is the single most repeated interaction in the workspace — any divergence there multiplies across every user, every day.

### 4. Count people, not rows

All Patients was rebuilt as a normalized, deduplicated union across all program lists. It's a small algorithmic change with an outsized trust effect: the headline population number now survives leadership scrutiny, and adding a new program automatically enrolls its patients in the count instead of silently omitting them.

### 5. One identity, source-aware navigation

Unifying the Fold ID and encoding the *source list* into patient URLs resolved a quiet ambiguity — "which patient is this, and how did I get here?" — that had made cross-program work feel like switching apps. The breadcrumb (*Population → \<list\> → Patient*) keeps the user's mental stack intact; shared links land colleagues in the same context, not just on the same patient.

### 6. Two levels of "open"

Rows support a **quick view** (lightweight context without leaving the queue) and a **full profile** (when the patient becomes the work). Early versions blurred the two — quick views that trapped users, or full navigations for what should have been a glance. Separating them, and making the escalation from quick view to full profile one click, matched the actual rhythm of triage: many glances, few deep dives.

### 7. Let each program keep its own status vocabulary

A tempting simplification was one universal status set. It was rejected: "Enrolled / Attempted / Engaged" (TOC outreach), "New / In Progress / Rebuttal" (HCC pipeline), and HEDIS gap statuses describe *different state machines*, and forcing them into shared words would blur exactly the distinctions users act on. Instead, statuses share *presentation* (one badge component, consistent color semantics) while keeping per-program *meaning* — same clothes, different words, canonical per program.

### 8. Details that respect the domain

Small decisions, repeatedly requested by users, applied family-wide rather than list-by-list: hovering any patient's age reveals the full date of birth (identity verification is constant in care work); overdue states get chips, not color alone; loading renders skeleton tables rather than spinners so layout never jumps; and the whole family passed a WCAG AA accessibility pass as a unit.

---

## Screens

| Surface | Purpose |
|---|---|
| **Population sub-nav** | The workspace map: All Patients, program worklists, agent queue, scheduling list — each with a live count. |
| **All Patients** | The deduplicated master roster: contact, location, insurance, chronic conditions, PCP, care programs, consent. |
| **TOC worklist** | Urgency-ordered transitions queue with countdowns, acuity, outreach history, and agent assignment; window vs. status views. |
| **HCC worklist** | The coding pipeline queue (see the HCC case study). |
| **CCM worklist** | Billable-time tracking with the billing-review drawer. |
| **AWV / HEDIS / SNP worklists** | Wellness-visit compliance, quality-gap management (with care-gap drawer), and SNP program tracking. |
| **Agent queue** | Patients assigned to AI agents, with a KPI summary bar and live agent status. |
| **Quick view / patient profile** | The two levels of patient depth, reachable from any row, with source-aware breadcrumbs. |

---

## Impact

> Quantitative results pending production rollout; placeholders marked.

- **New programs became composition, not construction.** After the shell and grammar stabilized, each subsequent worklist (CCM, AWV, HEDIS, SNP) shipped by composing shared pieces around a purpose-built table — the system's core bet, validated four times.
- **Cross-program fluency.** One interaction grammar means a care manager who learned TOC already knows how to search, filter, select, and bulk-act in HEDIS. The re-learning tax between programs is gone.
- **A population number the team can quote.** Deduplicated All Patients and the unified Fold ID turned "how many patients do we manage?" from an estimate into a fact.
- **Consistency as an ongoing practice.** The consolidation passes (shared filter bar, shared header, badge/icon normalization, AA accessibility) each removed a class of drift permanently — enforced by convention and review, so the family converges instead of fraying.
- *[Placeholders: time-to-ship for a new worklist before/after the system; daily active filter-set usage; cross-program task-switch time; population-count accuracy audit.]*

---

## Learnings

1. **Decide what must be identical and what must be free — explicitly.** The worklist family works because the boundary is written down: chrome, grammar, primitives, and identity are singular; tables, columns, statuses, and actions are sovereign. Most multi-workflow products suffer not from choosing the wrong side, but from never choosing.
2. **DRY is a tool, not a value.** Abstracting the tables would have produced less code and a worse product. The duplication at the table layer is the price of six workflows that each fit like they were built alone — and it's cheap, because everything around the tables is shared.
3. **Consistency is a process, not a state.** Letting lists diverge early and converging them in deliberate passes shipped faster *and* ended more consistent than a big-design-up-front system would have — because the consolidation passes worked with real, settled requirements instead of guesses.
4. **Identity is infrastructure.** The unglamorous work — one patient ID, deduplicated counts, source-aware URLs — did more for the workspace's perceived coherence than any visual refresh. Users experience "one product" through *the same patient being the same person everywhere*.
5. **Pin the invariants, free the rest.** Sticky patient-left / actions-right turned wildly different tables into one spatial habit. Finding the two or three anchors that can be invariant across every variant is what makes a family feel like a family.
6. **The most-repeated interaction deserves the most design discipline.** Filtering happens hundreds of times a day, so it got the strictest rule in the system (one chip component, no exceptions, migrate on touch). Ranking interactions by frequency, and spending consistency-budget accordingly, beat spreading polish evenly.
