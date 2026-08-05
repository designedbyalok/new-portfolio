---
title: Email Builder
tagline: "A visual email editor that gives care teams design-tool power — layers, inline editing, drag-and-drop — inside the most hostile rendering environment in software: the inbox."
period: "2026"
role: "Product design — end-to-end: IA, interaction design, visual design, editor ergonomics, design-system integration"
tags: ["Product design", "Visual editor", "Healthcare", "Email"]
external: https://fold.health
order: 4
idea: "A full-screen, three-pane visual editor — palette and layer tree on the left, a live WYSIWYG canvas in the middle, contextual properties on the right — where the canvas is the email and every edit happens in place."
problem: "Email was the campaign bottleneck: audiences and scheduling were self-serve, but the email itself meant reusing a tired template, hand-editing HTML, or waiting on a designer. Generic editors live outside the product, and email HTML fails silently — a layout that looks perfect in the editor collapses in Outlook, fonts fall back unnoticed, dark mode inverts colors into unreadability. Non-technical users have no way to anticipate any of it."
solution: "A design-tool grammar users already know: select on the canvas, edit inline, format from a floating selection toolbar, navigate deep nesting through a layers tree. Blocks and column scaffolds keep structure correct by construction; every style option is bounded to what email clients can honor. Existing HTML imports as editable blocks with computed styles preserved, device preview renders the real output HTML with a light/dark toggle, and a test mail is one click away."
whyUnique: "The medium's constraints were encoded rather than fought — when the tool can't express a mistake, users can't make it, and \"it looked different in the inbox\" disappears as a category. A layers panel in an email tool is unusual and earned: real emails nest, and the tree plus Enter/Shift-Enter traversal makes deep structure navigable. Of all the silent conversions in import, exactly one — font substitution — asks the user, at the one point fidelity genuinely breaks."
---

| | |
|---|---|
| **Product** | Fold Health — care-orchestration platform for value-based care |
| **Feature** | Email Builder: a full-screen visual template editor inside the Campaigns workflow |
| **Role** | Product design — end-to-end (IA, interaction design, visual design, editor ergonomics, design-system integration) |
| **Users** | Care-program managers, outreach coordinators, marketing/operations staff |

---

## Overview

Fold's outreach campaigns don't just place calls — they send email: appointment reminders, program enrollment invitations, wellness-visit nudges, newsletters. Every one of those emails needs to look credible and on-brand, because for a patient, a shabby email from their care team reads as a phishing attempt.

The Email Builder is where those templates get made: a full-screen, three-pane visual editor — component palette and layer tree on the left, a live WYSIWYG canvas in the middle, and a design/code/template properties panel on the right. Users compose emails from typed blocks (heading, text, image, button, columns, header/footer presets…), edit copy directly on the canvas, restyle through a floating selection toolbar, preview across devices and themes, send themselves a test, and hand the finished template to a campaign.

Two constraints shaped everything. First, the audience: outreach staff, not designers — they need Figma-like directness with none of Figma's learning curve. Second, the medium: email HTML is rendered by clients that are 20 years behind the web. The builder's job is to feel like a modern design tool while guaranteeing that everything a user can create will actually survive the inbox.

---

## Problem

### Email creation was the campaign bottleneck

Campaign audiences, scheduling, and send logic were all self-serve — but the email itself wasn't. Teams either reused one tired template, hand-edited HTML they didn't understand, or waited on someone with design skills. The most visible artifact of a campaign was the hardest part to produce.

### Generic email editors don't fit the workflow

Off-the-shelf editors (Mailchimp-style) solve template *editing*, but they live outside the product: separate logins, separate asset libraries, no connection to campaign audiences, and no path for the HTML templates organizations already own. The switching cost meant users defaulted back to "just reuse last month's email."

### The medium punishes ignorance silently

The cruelest property of email HTML is that mistakes don't fail loudly — they fail *in someone else's inbox*. A layout that looks perfect in the editor can collapse in Outlook, a custom font silently falls back to Times New Roman, dark-mode clients invert colors into unreadability. Non-technical users have no way to anticipate any of this. The tool has to absorb that expertise so the user never needs it.

### The design problem, stated plainly

> How might we let a non-designer produce a polished, on-brand, inbox-safe email in minutes — while letting them start from anything: a blank page, a preset, or an existing HTML template pasted in from anywhere?

---

## Goal

- **Directness.** Edit the email by touching the email: click text to type into it, drag blocks to move them, see exactly what recipients will see.
- **Structure without a syntax.** The block model (and a layers tree for when nesting gets deep) gives users the power of structured markup with none of its language.
- **Meet users where their content lives.** Existing HTML templates must import as *editable blocks*, not as a frozen blob — with visual fidelity preserved.
- **No inbox surprises.** Everything composable in the editor renders safely in real clients; previews cover device sizes *and* light/dark themes; a real test email is one click away.
- **Editor-grade forgiveness.** Deep undo, visible save state, autosave, and guarded exits — the trust features a tool needs before anyone will experiment in it.

---

## Process

### 1. Learn from design tools, not form builders

Early explorations followed the common email-editor pattern: click a block, edit its content in a side form. Testing killed it fast — the form-and-preview split forces users to map between two representations of the same thing. The revised direction committed to the design-tool grammar users already know from Figma/Slides: select on the canvas, edit *in place*, keep properties contextual in a side panel, and expose structure as a layer tree. The bet: outreach staff have all used slides software; the grammar transfers.

### 2. Choose the block vocabulary

Like the agent builder before it, the decisive early work was the palette. It settled into a progression that mirrors how people actually build emails:

- **Content:** Heading, Text, Image, Button
- **Decoration:** Social links, Divider, Spacer
- **Structure:** Hero, Wrapper, Section, Nav Bar, Columns, Table
- **Escape hatch:** Raw HTML, for the rare hand-coded fragment
- **Bookends:** Header and Footer — not single blocks but *preset pickers* with live-rendered designs, because headers and footers are where brand consistency matters most and where users want to start from something real, not a gray placeholder

Ready-made column layouts (2-equal, 1/2, 2/1, 3-equal…) ship as droppable scaffolds so multi-column structure — the hardest thing to build in email — starts correct instead of being assembled by hand. Two tiles (Accordion, Form) are visible but marked "soon": deliberate roadmap transparency instead of a palette that silently grows.

### 3. Respect the ceiling of the medium

Every block, style option, and preset was designed against email-client reality. That discipline ran through the whole feature: fonts come from a curated catalog (with only the weights each family actually ships), colors are always shown as hex, gradients and background images are supported only where clients support them, and the preview renders the *actual output HTML* — not an approximation — inside an isolated frame. The properties panel offers exactly what the medium can honor; nothing in the UI can produce an email that lies.

### 4. Iterate on the ergonomics

The editor's feel went through repeated tightening passes with real users: drag activation thresholds so clicks never misread as drags, drop indicators that show precisely where a block will land (including into empty containers and specific columns), a keyboard layer for power users, and a shortcuts-help popover so that layer is discoverable rather than tribal knowledge.

---

## Solution

### The workspace

A full-screen editor with a top bar — editable template name on the left; a **Builder / Desktop / Mobile** mode toggle in the center; undo/redo, shortcuts help, **Test Mail**, live save status, and **Save** on the right — above three panes:

- **Left — palette & layers.** Two tabs: *Components* (the block tiles and layout scaffolds, drag-to-canvas) and *Layers* (the document tree — select, rename, and reorder blocks by dragging, exactly like a design tool's layer list). The tree is the answer to deep nesting: when a button lives inside a column inside a wrapper, the layers panel makes it selectable in one click.
- **Center — the canvas.** A live rendering of the email that is also the editing surface. Text and headings edit inline where they sit. Selecting text summons a **floating toolbar** — bold, italic, underline, strikethrough, code, link, and a style-preset dropdown — right at the selection, so formatting never requires a trip to a panel.
- **Right — properties.** Three tabs: **Design** (contextual controls for the selected block, a selected column, or a bulk selection), **Code** (the underlying HTML/JSON for those who want it), and **Template** (email-wide settings). The panel is resizable from compact to wide — typography work wants room; canvas work wants none.

### Starting points, not blank pages

- **Header/Footer preset libraries** render each design *live* in the picker — real gradients, real type — so choosing a starting point is a visual decision, not a gamble on a thumbnail.
- **HTML import** is the power feature: paste an existing email template and it becomes *editable blocks*. The importer renders the HTML off-screen and reads the *computed* styles — so stylesheet classes, inherited colors, and font chains all survive the trip, not just inline styles. Where the pasted template uses fonts the builder can't load, a **font-substitution dialog** lists each unknown font and asks the user to map it to an available one (with a safe default pre-selected) — a silent fallback would have quietly broken brand typography; the dialog makes the trade-off visible and one click to resolve.

### Verification before send

- **Device preview** renders the final output at desktop and mobile widths, scaled to fit, inside a sandboxed frame — with a **light/dark theme toggle**, because recipients' inboxes have their own theme and dark mode is where email designs most often break.
- **Test Mail** sends the real thing to a real inbox from a small popover — the last step of trust no simulated preview can replace.

### Editor-grade trust

- **Undo/redo** across every operation (⌘Z / ⇧⌘Z), including drags and bulk moves.
- **Visible save truth:** the top bar shows either "Saved at 2:41 PM" or "3 unsaved changes" — a live count, not a vague dot. Autosave commits quietly after a pause in editing; explicit Save confirms with a toast.
- **Guarded exits:** closing — or clicking any sidebar destination mid-edit — with unsaved changes raises one clear choice: Keep Editing or Discard & Leave, with the change count in the message.
- **A skeleton that matches the room:** while a template loads, the builder renders a placeholder of its own exact chrome — three panes, stacked block shapes — so the workspace appears in place rather than popping in.

### Power under the surface

A complete keyboard layer for fluent users: duplicate (⌘D), rename (⌘R), delete, and — the structural ones — **Enter** to descend into a container (or select all its children at once) and **⇧Enter** to climb to the parent. Paired with bulk selection, a user can grab every block in a section and move or restyle them together. All of it documented in a shortcuts popover one click from the toolbar.

---

## Workflow

1. **Enter from a campaign** — the template is the campaign's payload; the builder opens full-screen over the app.
2. **Start** — blank, from a live-previewed header/footer preset, or by pasting an existing HTML template (resolving any unknown fonts in the substitution dialog).
3. **Compose** — drag blocks and layout scaffolds from the palette; the drop indicator shows exactly where each will land; the layers tree keeps deep structure reachable.
4. **Write in place** — click into any text and type; format from the floating selection toolbar.
5. **Style** — adjust the selected block (or column, or bulk selection) in the Design tab; fonts, weights, colors, spacing, and radii all within email-safe bounds.
6. **Verify** — flip to Desktop/Mobile preview, check dark mode, send a Test Mail to your own inbox.
7. **Save and ship** — autosave has been protecting the draft throughout; explicit Save confirms; close returns to the campaign with the template attached.

---

## Key Design Decisions

### 1. One representation, edited directly

The foundational choice: no form-vs-preview split. The canvas *is* the email, and every edit happens on or immediately beside it — inline text editing, a selection-anchored toolbar, contextual properties. Users stopped asking "where do I change this?" because the answer became "where it is."

### 2. A layers panel in an email tool

Unusual for the category, and earned: real emails nest (wrapper → columns → column → button), and canvas-only selection in nested structures is misclick hell. The layer tree — with drag-reorder and rename — borrowed straight from design tools, and immediately became the navigation of choice for complex templates. It also unlocked keyboard traversal (Enter/⇧Enter through the hierarchy) that flat editors can't offer.

### 3. Import must produce *editable* results

Accepting pasted HTML but rendering it as one untouchable blob would have technically checked the box and practically failed the user. Committing to full conversion — resolved computed styles, preserved layout, blocks all the way down — was the expensive path, but it's what turns "we have old templates" from a migration problem into a starting-point feature. The font-substitution dialog belongs to the same principle: at the one point where fidelity genuinely can't be preserved automatically, ask — visibly, once, with a safe default.

### 4. Preview the real thing, hostilely

The device preview renders the actual generated email HTML in an isolated, sandboxed frame — not the editor's canvas at a different width. That distinction is the whole point: the preview's job is to betray the design *before the inbox does*. Dark-mode preview earned its place the first time a template's dark-gray-on-white text disappeared into a dark-mode background; the theme toggle makes that class of failure visible pre-send.

### 5. Presets that show, not tell

Header/footer presets render live — the actual tree, the actual gradient, the actual type — rather than static thumbnails. Users choose with their eyes, and what lands on the canvas is pixel-identical to what they chose. The same conviction shows in the palette's "soon" badges: never let a picker promise something the canvas can't deliver.

### 6. Save state as a number, not a dot

"3 unsaved changes" communicates more than an asterisk ever could: it tells the user the *size* of what's at risk, makes the discard dialog concrete ("discard 3 changes?"), and pairs honestly with autosave's quiet "Saved at 2:41 PM." Ambient trust, built from specifics.

### 7. Escape hatches at both ends of the skill curve

For the non-technical user: presets, scaffolds, and inline editing mean never touching a property they don't understand. For the power user: a Code tab showing the real HTML/JSON, a Raw HTML block for hand-written fragments, and the full keyboard layer. Neither audience pays for the other's needs — the growth path from beginner to fluent lives inside one tool.

---

## Screens

| Surface | Purpose |
|---|---|
| **Builder workspace** | Top bar (name, mode toggle, undo/redo, test, save state) over palette + canvas + properties. |
| **Components palette** | Block tiles and column-layout scaffolds, dragged onto the canvas. |
| **Layers tree** | The document structure: select, rename, drag-reorder any block at any depth. |
| **Canvas** | The live, directly editable email — inline text editing, drop indicators, selection outlines. |
| **Selection toolbar** | Floating text formatting (B/I/U/S/code/link + style presets) anchored to the selection. |
| **Properties panel** | Design / Code / Template tabs; contextual to block, column, or bulk selection; resizable. |
| **Preset pickers** | Live-rendered header and footer designs. |
| **Font-substitution dialog** | Maps unknown imported fonts to loadable ones, safe default preselected. |
| **Device preview** | Real output HTML at desktop/mobile widths with a light/dark theme toggle. |
| **Test-mail popover** | Send the actual email to a real inbox. |
| **Shortcuts popover** | The keyboard layer, documented in place. |

---

## Impact

> Quantitative results pending production rollout; placeholders marked.

- **The campaign bottleneck moved.** Email creation went from "wait for someone who knows HTML" to a self-serve step inside the campaign flow — template production now happens at the speed of the person who owns the campaign.
- **Existing assets became starting points.** HTML import with editable conversion means organizations' template libraries carried over instead of being rebuilt — the single biggest adoption unlock for teams with established brands.
- **Inbox failures moved pre-send.** Real-output previews, dark-mode checking, and one-click test mail catch the medium's betrayals while they're still free to fix.
- **One grammar with the rest of Fold.** The builder shares the app's interaction language (drag-drop, undo, save-state, skeletons, shortcut popovers) with the agent builder and worklists — a user who knows one Fold editor is already oriented in this one.
- *[Placeholders: time-to-first-template for a new user; % of campaigns using self-built vs. reused templates; test-mail usage rate; import success rate on customer template libraries.]*

---

## Learnings

1. **Borrow the grammar of the tools your users already respect.** The design-tool pattern — canvas, layers, inline editing, floating toolbars — transferred to non-designers faster than any simplified form-based editor tested. People don't need simpler tools so much as *familiar* ones.
2. **In a constrained medium, the constraint is the design system.** Email HTML's limitations weren't fought; they were encoded — into the palette, the font catalog, the style options. When the tool can't express a mistake, users can't make it, and "it looked different in the inbox" disappears as a category.
3. **Import quality decides adoption.** Features that meet users' existing content where it lives outperform features that ask users to start over. The computed-style import was disproportionately expensive and disproportionately worth it.
4. **Ask at the moment of loss, silently handle everything else.** Of all the automatic conversions in import, exactly one — font substitution — surfaces a dialog, because it's the one place fidelity genuinely breaks. Everything else resolves silently. That ratio (one question, dozens of silent saves) is what "it just worked" feels like from the inside.
5. **Preview must be adversarial to be useful.** A preview that flatters the design is decoration. Rendering the true output, sandboxed, at hostile widths and in dark mode, made the preview the place where problems die — which is the only justification a preview has.
6. **Specific beats ambient for trust signals.** "3 unsaved changes" and "Saved at 2:41 PM" outperformed dots and asterisks in every walkthrough — users glance, know exactly where they stand, and keep working. Vagueness is what makes people compulsively hit ⌘S.
