// Plain-text helpers with no Astro imports, so they can be shared and tested outside a build.

/** First ~160 chars of plain text, for meta descriptions when the CMS has none. */
export function excerpt(markdown: string, max = 160): string {
  const text = markdown
    .replace(/<[^>]+>/g, " ") // strip inline HTML (some sources emit tables etc.)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[\s>#*_~|]*[-*+]\s+/gm, "") // leading list markers / blockquote
    .replace(/^-{3,}\s*$/gm, " ") // horizontal rules
    .replace(/[#>*_`~|]/g, " ") // remaining inline markdown (keep in-word hyphens)
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}
