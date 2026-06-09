---
company: JobStax
role: Creator & Solo Builder
period: "2024"
summary: Designed and shipped Stax — a single-canvas tracker that turns a chaotic multi-tab process into one quiet board. Built end-to-end in eight days.
website: https://jobstax.vercel.app
order: 4
hero: https://picsum.photos/seed/jobstax-hero/1600/900
logo: /favicon.svg
photos:
  - src: https://picsum.photos/seed/jobstax-board/1400/900
    caption: The single-canvas tracker. No modals, no nested screens.
    aspect: 14 / 9
  - src: https://picsum.photos/seed/jobstax-resume/1400/900
    caption: The full-screen, split-panel resume editor inside the tracker.
    aspect: 14 / 9
projects:
  - title: Concept to production
    description: "8 days"
  - title: Commits shipped
    description: "83"
  - title: Platforms parsed
    description: "5"
  - title: Modals in the product
    description: "0"
---

## I. The Problem

**A familiar mess**

Job searching is a logistics problem disguised as an emotional one. You’re applying to ten roles a day across LinkedIn, Greenhouse, Lever, Workday, and Indeed. Each one demands a slightly different resume, a mental model of where you are in the process, and a memory of when you last heard back.

The tools that exist fall into two camps: spreadsheets that become unreadable after thirty rows, or heavyweight CRMs that treat a personal job search like an enterprise sales pipeline. Neither respects the actual rhythm of looking for work — which is messy, anxious, and happens in short bursts between real life.

- No single place to see all applications at a glance
- Manual data entry for every role — copy-pasting titles, companies, links
- No way to know which applications have gone quiet without scrolling through everything
- Existing trackers optimize for power users, not for people who are already overwhelmed

**The insight**

The job tracker shouldn’t add cognitive load — it should absorb it. I wanted something I could open once a day, understand instantly, and close without guilt. Not a system to maintain. A surface that maintains itself.

## II. Four Design Decisions

### 1. Paste-first interaction

*Core loop*

The input mechanism is a URL. Instead of asking users to fill out a form — company, role, location, salary — Stax takes a single paste. Drop in a job listing URL from any of the top five platforms, and the parser extracts title, company, location, and salary range. A card appears in the Saved column, pre-filled and ready to review.

This collapses the friction between “I found something interesting” and “it’s in my system” to about ten seconds. The mental cost of tracking a new role drops low enough that you actually do it — even the speculative ones, even the “maybe later” ones.

- Parsers for LinkedIn, Greenhouse, Lever, Workday, and Indeed
- Graceful fallback to a pre-filled manual form when a site resists scraping
- Title, company, location, and salary extracted — user reviews and saves

### 2. Card-as-workspace

*Interaction model*

Every card is a workspace, not a row in a table. Contacts, timeline, resume version, next action — all inline-editable, all on the card itself. No modals. No nested screens. No save buttons.

Most trackers treat each application as a data point. Stax treats each one as a small project. The card holds the recruiter’s name, the resume version you sent, the date of your last interaction, and a freeform notes area. You don’t navigate away from the board to manage a single application — you expand the card and everything is right there.

This was a deliberate trade-off against information density. The board shows fewer cards at once than a spreadsheet would. But each card carries its full context, which means you spend less time clicking between views and more time actually understanding where things stand.

### 3. Calm over comprehensive

*Philosophy*

Stax sends one email per week. A Monday morning digest surfaces the applications that have gone quiet — cards sitting in Applied for seven or more days without movement. That’s the entire notification system. No per-card pings. No daily reminders. No FOMO triggers.

On the board itself, stale cards get a quiet visual nudge — a small timestamp in the corner — rather than a red badge or an alert. The idea is that signal should be ambient, not interruptive. You notice it when you’re looking; it doesn’t chase you when you’re not.

This philosophy extends to the whole product surface. There’s no onboarding wizard, no feature tour, no gamification. The board is the product. Open it, see your search, act or don’t.

### 4. Resume builder

*Feature*

A full-screen, split-panel resume editor lives inside the tracker. Left panel for editing content and choosing design options — fonts, layout, social links. Right panel for a live preview with a pagination engine that handles multi-page resumes correctly.

The connection between tracker and resume builder is the key: each card can reference a specific resume version, so you always know which version you sent to which company. No more guessing which PDF you attached three weeks ago.

- Google Fonts integration for typographic control
- Pagination engine that handles page breaks cleanly
- Responsive panels that adapt from desktop to mobile
- PDF export for the final version

## III. How I Built It

**Stack and architecture**

Next.js with Turbopack, TypeScript, Tailwind CSS, Prisma ORM, Supabase (Postgres), and NextAuth. Deployed on Vercel with Sentry for error monitoring and PostHog for analytics. Gemini API powers the AI-assisted job parsing. Resend handles the Monday digest emails.

I chose this stack because it let me move fast as a solo builder while keeping production quality high. Prisma and Supabase meant I could iterate on the data model without migration headaches. NextAuth gave me auth in an afternoon. Vercel’s preview deployments let me ship confidently.

**Development timeline**

Eight days from first commit to production deployment. The pace was intentional — I wanted to prove I could take a product from concept to shipped software quickly, making real design decisions under real constraints rather than polishing mockups indefinitely.

- Day 1 — Core data model, auth, kanban board with drag-and-drop
- Day 1-2 — Welcome flow, contacts, phone fields, loading states
- Day 2-3 — PDF preview, React Query optimization, JWT edge cases
- Day 4-5 — Sentry integration, Turbopack build fixes, production hardening
- Day 5-6 — Resume builder: full-screen split panel, pagination engine
- Day 7 — Salary benchmarks, insights fallbacks, seed data
- Day 8 — UI polish, dropdown fixes, production error monitoring

**The hard parts**

Three problems tested the design-engineering loop most directly.

First, React hooks ordering in the resume builder. The component structure needed conditional rendering for different resume layouts, but React’s rules of hooks don’t bend for conditionals. I restructured the component tree to keep hooks at the top level while pushing layout variation into child components — a case where the engineering constraint improved the component architecture.

Second, JWT lifecycle versus user data. When a JWT outlives the user row it references (a P2003 foreign key violation in Prisma), the app crashes on every authenticated request. I added graceful session invalidation that catches the mismatch and forces a clean re-auth instead of an error page.

Third, React Query refetch storms. The initial implementation fired redundant queries on every card interaction, creating visible lag on the board. I restructured the query keys and added stale-time configuration to cut unnecessary network calls without sacrificing data freshness.

## IV. What I Shipped

**The product**

A production web app at [jobstax.vercel.app](https://jobstax.vercel.app), currently in closed beta.

- Kanban board with five columns: Saved, Applied, Phone Screen, Interview, Offer
- URL-based job capture with parsers for five major platforms
- Card-as-workspace with inline-editable contacts, notes, resume version, and timeline
- Monday digest email surfacing stale applications
- Full-screen resume builder with live preview, pagination, and PDF export
- Salary benchmarks and insights
- Google and email authentication via NextAuth
- Error monitoring with Sentry, analytics with PostHog

**What this demonstrates**

Stax is a complete product, not a prototype. It has auth, data persistence, error handling, monitoring, and analytics. It handles edge cases — malformed URLs, expired sessions, scrapers that fail gracefully. It ships a landing page that communicates the product clearly enough to drive beta signups.

For me, this project is the clearest proof of what I do: I identify a real problem, make opinionated design decisions about how to solve it, and then build the thing end-to-end. I write the CSS and the database migrations. I pick the interaction model and the ORM. I think about what not to build as much as what to build — and the result is a product that feels calm because every feature that would have made it noisy was deliberately left out.
