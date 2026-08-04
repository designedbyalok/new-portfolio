---
title: HCC Coding
tagline: "A review workflow that turns risk-adjustment coding into a fast, auditable, keyboard-driven flow."
period: "2026"
role: "Product design — end-to-end: domain research, workflow mapping, IA, interaction design, iteration with real coding teams"
tags: ["Product design", "Healthcare", "Expert tools", "Workflow"]
external: https://fold.health
order: 2
idea: "Model the interface around the coder's actual decision unit — the diagnosis x visit pair — and put the evidence, the judgment, and the audit trail on one screen, driven from the keyboard."
problem: "A single patient can carry a dozen diagnoses across several visits, and the coder asks the same question hundreds of times a day: for this diagnosis, on this date of service, does the chart support it? Legacy tools organised by visit, patient, or claim — never by that pair — so context was constantly re-derived, evidence lived in another window, the multi-stage pipeline was invisible, and QA rework destroyed prior work."
solution: "One card per diagnosis with one action row per visit, so a condition's whole year reads at a glance. A second pane brings documents, comments, history and claims beside the decision, scoped to whatever summoned them. A persistent shortcut bar (A accept, X reject, M missed, D defer) makes the loop read-key-next. The four-stage pipeline — support, coder, QA, compliance — is a first-class object on every surface, with a hard visible gate before charts are ready."
whyUnique: "Vocabulary was treated as a design deliverable: different judgments got different verbs, because confirming an AI suspect asserts something different from accepting documented evidence, and flattening both into Accept/Reject corrupts the data downstream. Renaming Returned to Rebuttal turned QA from an adversarial gate into a feedback channel. Speed and auditability came from the same move — making every decision small, explicit and atomic."
---

| | |
|---|---|
| **Product** | Fold Health — care-orchestration platform for value-based care |
| **Feature** | HCC (risk-adjustment) coding: worklist, Diagnosis Gaps review panel, document intake, multi-stage review pipeline |
| **Role** | Product design — end-to-end (domain research, workflow mapping, IA, interaction design, iteration with real coding teams) |
| **Users** | Medical coders, support/chart-chasing staff, QA reviewers, compliance reviewers, coding managers |

---

## Overview

Medicare Advantage plans are paid based on how sick their patients *provably* are. That proof is HCC coding: every chronic condition must be re-documented by a provider every single year, supported by evidence in the chart, and submitted on a claim. Miss the documentation, and the condition — and the revenue attached to it — disappears from the patient's risk score.

The work of not-missing falls on medical coders. For each patient, a coder walks through every diagnosis across every visit of the year and makes a judgment call: is this condition supported by the note? Their decisions then pass through QA and compliance review before anything is submitted.

This case study covers the design of that entire workflow inside Fold: the **worklist** where coding work queues up, the **Diagnosis Gaps panel** where individual decisions are made, the **document intake** that feeds it, and the **staged review pipeline** that carries a record from chart collection to final submission.

The design brief, distilled: coders are paid for accurate throughput. Every unnecessary click, every ambiguous status, every "wait, which visit is this?" moment is money and accuracy lost. Design for speed *and* defensibility — because every decision made here may later be audited by CMS.

---

## Problem

### The work itself is a grind

A single patient can have a dozen diagnoses spread across several visits. The coder's real question is always the same — *"for this diagnosis, on this date of service, does the chart support it?"* — repeated hundreds of times a day. Existing tools (spreadsheets, EHR side panels, legacy coding software) made each repetition expensive:

- **The unit of work was blurry.** Tools organized by visit, or by patient, or by claim — but the coder's actual decision unit is a *(diagnosis × visit)* pair. Users constantly re-derived context: "I've seen this code before… was that on the March visit or the June one?"
- **Judgment and evidence lived in different places.** Confirming a diagnosis needs the chart; the chart lived in another window. Alt-tabbing between the decision and its evidence was the single largest time sink.
- **The pipeline was invisible.** A record passed through support staff, a coder, QA, and compliance — but nobody could see where a record was, who was blocking it, or why it came back.
- **Rework was destructive.** When QA found an issue, records got "returned" in ways that lost the coder's prior work — and the word *returned* itself read as a rejection of the coder rather than a request for another look.
- **AI suggestions were graded wrong.** Analytics-suggested conditions ("suspects") were presented as accept/reject decisions — but a suggested condition that was never coded isn't accepted or rejected; it's *confirmed as a missed opportunity* or *dismissed as noise*. Forcing the wrong verbs onto that judgment corrupted both the data and provider-education downstream.

### And the stakes are asymmetric

An over-coded condition is a compliance risk (audits, clawbacks). An under-coded one is silent lost revenue. The interface has to make careful judgment *faster* — not just make clicking faster.

---

## Goal

**For coders** — make the atomic decision loop (read evidence → decide → next) as close to zero-friction as possible; keep evidence, context, and history one glance away, never one window away.

**For the team** — make the multi-stage pipeline legible: every record shows where it is, who owns it, what's blocking it, and what happens next.

**For the organization** — every decision auditable (who, what, when, why), every intake failure visible immediately, nothing silently dropped.

**Design principles**
1. **Model the work, not the data.** The interface's unit must be the coder's decision unit — the diagnosis × visit pair — even though no upstream system stores it that way.
2. **Hands on keys.** Review work is rhythm work. The keyboard is the primary instrument; the mouse is the fallback.
3. **Status is a narrative.** "Where is this record and why?" should never require asking a manager.
4. **Words carry judgment.** Action verbs and status labels were designed as carefully as layouts — the wrong word teaches the wrong process.

---

## Process

### 1. Learning the domain before drawing

HCC coding is dense with rules that directly shape interface truth: annual re-documentation, evidence requirements (a diagnosis only counts if the note shows the provider actively addressed it), code hierarchies where one diagnosis supersedes another, and the difference between an open gap, a suspect, and a recapture. I spent the first stretch building a shared vocabulary document with the clinical team — which became the canonical reference the whole feature (and this case study) is built on. The lesson institutionalized early: **in expert tools, the design's correctness is domain correctness.**

### 2. Mapping the real pipeline

Shadowing the workflow surfaced five distinct personas touching every record, each with different needs:

```
Support Team ──▶ Coder ──▶ QA Review ──▶ Compliance ──▶ Submission
(chart chasing)  (decisions) (sampled)     (random pull)   (output file)
        ▲                        │
        └────── Rebuttal ◀───────┘  (returned with reason, work preserved)
```

- **Support** collects and quality-checks documents. A key finding: coders were starting records whose charts weren't ready, then abandoning them. That became a design mandate — a **hard, visible gate**: a coder cannot begin a record until support has cleared its document, and the record says so, rather than merely discouraging it.
- **QA** reviews a sampled percentage, not everything. **Compliance** pulls randomly — deliberately including records QA's sampling skipped — and is view-only while work is still moving.
- **Managers** assign and re-assign people per stage, including skip-ahead overrides.

Designing the pipeline first, screens second, meant every later surface (worklist columns, stage pills, status menus) was rendering one shared model instead of inventing its own.

### 3. Prototype → walkthrough → revise

The panel went through persona-based walkthroughs with the coding operations team and external review rounds. Several of the decisions below — the card-per-diagnosis inversion, the rename to "Rebuttal," suspect verbs, the sort-vs-filter fix — came directly out of watching real reviewers get stuck.

---

## The Workflow

End-to-end journey of a single record:

1. **Intake.** Charts arrive by upload, batch transfer, or EHR pull. Text extraction runs automatically on upload — no "start processing" button — and clean documents are added to the queue automatically overnight; humans only review what the system couldn't validate itself. Failures (a corrupt file, a wrong format) surface immediately, never silently dropped.
2. **Support review.** Support staff pass/fail each document, fix patient matching, and request missing records. Until they clear a document, the record is visibly blocked for coding.
3. **The worklist.** Coders work from a queue of patient records showing due dates, open diagnosis counts, and a per-stage pipeline strip (support / coder / QA / compliance) so the whole team reads one table the same way. Filters are saved and shareable; sorting defaults to newest-created.
4. **The Diagnosis Gaps panel.** Clicking a row opens the decision workspace: patient banner (with current risk score and potential uplift), stage and assignee context, then one **card per diagnosis** with one **action row per visit**.
5. **Decide.** For each diagnosis × visit row: **Accept** (evidence supports it), **Reject** (it doesn't), **Missed opportunity** (condition is real, but this visit can't support it — routed to provider education instead of billing), or **Defer** (leave for later/another reviewer). AI-suggested and prior-year conditions live in their own section with their own verbs — **Missed / Dismiss** — because confirming a suggestion is a different judgment than accepting documented evidence.
6. **Evidence in place.** Documents, comments, activity history, and claims open in a second pane *beside* the cards — scoped to the exact diagnosis or visit that summoned them — so the decision and its evidence share one screen.
7. **Complete.** Finishing a record auto-resolves any rows the coder consciously left untouched (with a visible count), then hands off to QA.
8. **QA / Rebuttal.** QA reviews its sample; issues send the record back as a **Rebuttal** with a stated reason — prior work intact, nothing re-done from scratch.
9. **Compliance & output.** Compliance spot-checks; completed records feed the submission file. The final pipeline action is explicitly labeled as preparing that file — not a vague "send."

---

## Key Design Decisions

### 1. Invert the hierarchy: one card per diagnosis, one row per visit

The original panel grouped rows by visit-association buckets — mirroring how the data arrived. Coders hated it in exactly the way the research predicted: the same diagnosis appeared in multiple places, and its year-long story was scattered.

The redesign flipped the axis. Each **diagnosis** gets one card; inside it, each **visit** gets one action row. The coder now reads a condition's whole year at a glance — which visits are claimed, which are open, which were manually added — and works down the card. This single inversion did more for speed and comprehension than every other change combined, because it aligned the screen with the question the coder is actually asking.

### 2. Give different judgments different verbs

Regular documented diagnoses get **Accept / Reject**. AI suspects and prior-year recaptures get **Missed / Dismiss** — deliberately *not* the same buttons:

- Accepting a documented diagnosis asserts "the evidence supports this."
- Confirming a suspect asserts "this condition is real and we failed to capture it" — which both adds it to the submission *and* flags the provider for education.

Using one verb set for both would have flattened two different truths into one log. The suspect actions are also always primary, visible buttons — never buried in an overflow menu — because burying the highest-value-recovery action behind a "⋯" is how opportunities stay missed.

### 3. Design for the keyboard, chrome for the mouse

A persistent shortcut bar anchors the panel: **A** accept · **X** reject · **M** missed opportunity · **D** defer · **↑↓** move between rows · **Enter** open the document. A focus ring tracks the active row; shortcuts are suppressed while typing. The experienced coder's loop becomes *read → key → next* without the hand leaving the keyboard — while every action remains available as a visible button for newcomers. Bulk selection with checkboxes handles the "this whole visit is fine" case in one action (each row still logged individually, for the audit trail).

### 4. Bring evidence to the decision, not the decision to the evidence

Rather than navigating away to documents or history, the panel widens into a second pane — activity, notes, comments, documents, claims — opened *from* the thing being decided and scoped *to* it. Clicking the comment icon on a diagnosis card opens comments about that diagnosis; opening claims from a visit row shows that visit's claim. Patient-level dumping grounds were explicitly rejected: context that isn't scoped is context the user has to re-filter in their head.

### 5. Make the pipeline a first-class UI object

Every record carries its stage everywhere it appears: a stage pill in the panel (hover reveals the full four-stage progress), per-role columns on the worklist, an assignee avatar with inline reassignment, and a status menu whose states match the real process (New, In Progress, Completed, Rebuttal, Records Requested, Insufficient…). The support-team gate is rendered as a visible block, not a tooltip warning. The goal: no record whose location or blocker requires a Slack message to discover.

### 6. Rename "Returned" to "Rebuttal"

Small change, real effect. "Returned" framed QA feedback as rejection — coders read it as a mark against them, and the process as adversarial. **Rebuttal** frames it as a structured disagreement to be answered: it arrives with a reason, keeps all prior work, and routes back for a response. Language was treated as part of the workflow design, because the workflow is executed by people who read the labels.

### 7. Never lose a leftover — resolve it explicitly

Completing a record with untouched rows silently discarding them was unacceptable; forcing a decision on every row punished coders for correctly ignoring irrelevancies. The compromise: completion auto-resolves the remaining rows and *tells the coder how many* — deliberate, visible, and reversible through the record's history, rather than silent in either direction.

### 8. Sort is not a filter

Reviews kept surfacing the same confusion: the worklist's "Due Date" chip looked like it controlled ordering. The fix separated the concepts explicitly — the queue sorts by creation date (newest work first) by default, and due-date is a *filter* chip like any other. A reminder that most "users don't understand the table" feedback is really two controls wearing the same clothes.

### 9. Fail loudly at intake

A batch document that fails extraction on a competitor's tooling can sit unnoticed for a day. Here, intake failures surface the moment they happen, in the review queue, with the reason. Automation was designed with an explicit contract: the system auto-handles only what it can fully validate; everything else is escalated to a human *immediately and visibly*. In compliance-bound work, a silent failure is worse than a slow process.

---

## Screens

| Surface | Purpose |
|---|---|
| **HCC Worklist** | The team's queue: patient rows with due dates, open-diagnosis counts, a per-stage pipeline strip, saved/shareable filters, bulk re-assignment. |
| **Diagnosis Gaps panel** | The decision workspace: patient banner with risk score and uplift, stage & assignee context, diagnosis cards with per-visit action rows, suspect/recapture groups, keyboard shortcut bar. |
| **Second-pane workspace** | Slide-out companion for evidence and context: activity, notes, comments, documents, claims — always scoped to the diagnosis or visit that opened it. |
| **Document intake drawers** | Upload → automatic extraction → confidence review → ready; batch (SFTP) intake review; add-a-visit flow tied to source documents. |
| **Review progress popover** | The four-stage pipeline for one record — who's done, who's next, what's blocked — ending in explicit submission-file readiness. |
| **Claim preview** | What will actually be submitted for a visit, reviewable before it leaves. |

---

## Impact

> Quantitative results pending production rollout; placeholders marked.

- **The decision loop got shorter in kind, not just degree.** Evidence, history, and the decision now share one screen; the keyboard carries the rhythm. The alt-tab — previously the largest single time cost per decision — is gone from the core loop.
- **The pipeline became self-describing.** Stage, owner, and blockers are readable off the worklist and the panel; "where is this record?" stopped being a management question.
- **Judgments got cleaner data.** Separating Missed/Dismiss from Accept/Reject means provider-education pipelines and submission files are fed by decisions that actually mean what they say.
- **Rework became non-destructive.** Rebuttals carry reasons and preserve work, converting QA from a feared gate into a feedback channel.
- **Nothing disappears silently.** Every action is logged with actor and reason; every intake failure surfaces same-day — a direct differentiator against incumbent tools in customer evaluations.
- *[Placeholders: decisions per coder-hour before/after, QA rebuttal rate trend, recapture rate, intake-failure time-to-surface, documented RAF uplift.]*

---

## Learnings

1. **Find the atomic unit, then build everything around it.** The diagnosis × visit pair was the invisible center of this entire domain. Once the interface committed to it — one card per diagnosis, one row per visit — layout, shortcuts, scoping, and logging all fell into place. Most of the legacy tools' pain came from organizing around what the *data* looked like instead of what the *decision* looked like.
2. **Vocabulary is a design deliverable.** "Rebuttal" vs. "Returned," "Missed" vs. "Accepted," "sweep," "recapture" — in expert workflows, labels teach the process and misteach it just as easily. Writing the domain glossary *before* the screens was the highest-leverage week of the project.
3. **Speed and auditability aren't in tension if you design them together.** Keyboard-first review and per-action logging came from the same design move: making each decision small, explicit, and atomic. The thing that makes the coder fast is the same thing that makes the auditor confident.
4. **Design the handoffs, not just the screens.** The gates between personas — support-to-coder blocking, QA sampling, compliance's random pull, rebuttal loops — shaped more of the user experience than any individual layout. Workflow tools live or die at the seams.
5. **Asymmetric automation earns trust.** Automating only what the system can fully validate, and loudly escalating the rest, made the coding team trust the automation far more than a "smarter" system that guessed. In high-stakes work, predictability beats capability.
6. **Watch for controls wearing the wrong clothes.** The due-date chip that looked like a sort, the overflow menu that hid a primary action — the recurring review findings weren't visual polish issues but *mismatches between a control's appearance and its role*. Fixing those cost hours and returned more than any redesign.
