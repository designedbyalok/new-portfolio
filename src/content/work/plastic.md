---
company: Plastic
kind: project
role: Creator & Solo Builder
period: "2026 — Present"
summary: A visual design tool where HTML and CSS are the design source. Build real interfaces on a canvas, edit the same files in code, and work with coding agents without a separate handoff.
website: https://useplastic.app
order: 6
hero: /projects/plastic/hero.webp
logo: /projects/plastic/logo.webp
---

## Why I am building Plastic

I spend my time on both sides of the design process: deciding how an interface should feel and writing the code that makes it work. Moving between those two worlds still means translating the same decisions. A layout becomes a specification, then an implementation, then another round of adjustments to get the browser to match the design.

Plastic starts with a different question: what if the design file was already the interface?

I am building a visual editor where the canvas renders real HTML and CSS. Frames, layers, text, layout, and styling are ways to work with that source visually. The code panel shows the same files, so I can move between drawing and writing code without maintaining two versions of the work.

## The design decisions

### The browser is the layout engine

Flexbox, grid, typography, and the CSS cascade are part of the design itself. A button is a button; an input is an input. Semantic elements keep their attributes, and responsive breakpoints and hover or focus states live with the element they affect.

The goal is to make the visual tools familiar while keeping the result grounded in how interfaces actually behave in a browser.

### Plain files that stay useful outside the editor

A local Plastic project is a folder: an HTML file for each page, a stylesheet, design tokens, and project metadata. It can be opened in a text editor, reviewed in Git, or changed by another tool.

Changes made outside Plastic appear in the editor as undoable edits. That matters because the canvas should be one way to work on an interface, rather than the only place its source can be understood.

### Agents work on the same source

Plastic exposes designs and tokens through MCP, letting coding agents read and edit the actual document. Their changes appear on the canvas, with indicators showing which frames they are reading or editing.

This gives an agent the structure and styling behind a design, rather than asking it to reconstruct everything from a screenshot. Frame links also make it possible to point to a specific part of the work.

### Bring existing work along

Figma import lets users start with an existing `.fig` file. Pages, frames, auto layout, text, images, vectors, and variables are converted into editable HTML and CSS. Missing fonts are highlighted so the conversion can be checked rather than assumed to be identical.

## What I am building

Plastic brings together a canvas, layers panel, inspector, and live code view. The editor includes semantic HTML elements, flex and grid layout, vector tools, components and variants, design tokens, responsive styles, and interaction states.

The application is built with React and TypeScript. A document model connects the visual editor to HTML/CSS serialization, browser rendering, history, and autosave. The hosted app uses Cloudflare Workers, D1, and Better Auth; the Mac app uses Electron for a desktop workflow with local files and agent integration.

## Current state

I am actively developing Plastic. The web app is in an invite-only preview at [useplastic.app](https://useplastic.app), and Plastic for Mac has an Apple silicon release. The product is evolving as I refine the editing workflow and learn from early use.

For me, Plastic is a way to bring design and engineering into the same working surface: make the interface, inspect its source, and keep improving the same thing.
