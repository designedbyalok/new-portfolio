import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { getAllPosts } from "../lib/cms";

export const prerender = true;

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/**
 * Sort key for a period string like "Aug 2021 — Jun 2023" or "Jun 2023 — Present".
 * Ongoing roles sort first, then by most recent end date.
 */
function periodRecency(period: string): number {
  if (/present/i.test(period)) return Number.MAX_SAFE_INTEGER;
  const matches = [...period.matchAll(/([A-Z][a-z]{2})[a-z]*\s+(\d{4})/g)];
  if (matches.length === 0) return 0;
  const last = matches[matches.length - 1];
  return Number(last[2]) * 12 + (MONTHS[last[1]] ?? 0);
}

function underline(heading: string): string {
  return `${heading}\n${"-".repeat(heading.length)}`;
}

/**
 * /ai.txt — plain-text profile for AI agents and crawlers.
 * Facts are sourced from the content collections, the CMS, and the
 * resume/about pages of this site — nothing invented.
 */
export async function GET(context: APIContext) {
  const site = context.site ?? new URL("https://www.designedbyalok.com");
  const abs = (path: string) => new URL(path, site).href;

  const work = (await getCollection("work")).sort(
    (a, b) => periodRecency(b.data.period) - periodRecency(a.data.period),
  );
  const projects = (await getCollection("projects")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const posts = await getAllPosts();

  const text = `ALOK KUMAR — PRODUCT DESIGNER
${abs("/")}

${underline("Biography")}
Alok Kumar is a product designer simplifying digital healthcare, based in
Pune, India. A 0-to-1 product designer with a background in Computer Science
(B.E., Anna University, Chennai, 2016-2020), he integrates design and
development to create delightful experiences, and is competent across the
entire design process — delivering holistic, impactful solutions. He has been
designing websites and apps for years, working with startups and small teams,
and has been a Product Designer at Fold Health since June 2023, designing for
Primary & Chronic Care. He is driven by a broad interest in creative fields
like architecture, photography, branding, and digital products.

${underline("Experience")}
${work
  .map(
    (entry) =>
      `${entry.data.company} — ${entry.data.role} (${entry.data.period})\n  ${entry.data.summary}`,
  )
  .join("\n\n")}

${underline("Projects")}
${projects
  .map(
    (entry) =>
      `${entry.data.title} (${entry.data.period})\n  ${entry.data.tagline}`,
  )
  .join("\n\n")}

${underline("Writing")}
${posts
  .map((post) => `${post.title}\n  ${abs(`/blog/${post.slug}`)}`)
  .join("\n\n")}

${underline("Skills")}
Design & Research: Design Research, Wireframing, UI/UX Design, Interaction Design, Rapid Prototyping, Design Systems
Software: Figma, Sketch, Adobe XD, InVision, Framer, Photoshop, Illustrator, InDesign, After Effects, Final Cut Pro, Cinema4D
Programming: HTML, CSS, JavaScript, Node.js, Python, MySQL, Git, C++, Java

${underline("Contact")}
Email: designedbyalok@gmail.com
Website: ${abs("/")}
GitHub: https://github.com/designedbyalok
Twitter/X: https://x.com/designedbyalok
LinkedIn: https://www.linkedin.com/in/designedbyalok/
Dribbble: https://dribbble.com/designedbyalok

Canonical machine-readable map: ${abs("/llms.txt")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
