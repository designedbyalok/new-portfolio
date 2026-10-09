import { Marked } from "marked";

// One Markdown renderer for every content page. Content comes from CMSes, and Mantel's
// editor writes some HTML into Markdown (alignment, colour, audio, toggles), so raw HTML
// is filtered to an allowed set of tags and attributes, and links and images must use
// a safe protocol. Safe Markdown renders exactly as marked's defaults would.

type Kind = "link" | "image" | "audio";

const PROTOCOLS: Record<Kind, RegExp> = {
  link: /^(?:https?|mailto|tel):/i,
  image: /^(?:https?:|data:image\/(?:png|jpe?g|gif|webp);)/i,
  audio: /^(?:https?:|data:audio\/[a-z0-9.+-]+;)/i,
};

const NAMED: Record<string, string> = { colon: ":", tab: "\t", newline: "\n", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (whole, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED[entity.toLowerCase()] ?? whole;
  });
}

/** True for relative URLs and for URLs whose protocol is allowed for this kind of use. */
export function safeUrl(url: string | null | undefined, kind: Kind = "link"): boolean {
  if (!url) return false;
  // Browsers ignore control characters and whitespace inside a scheme, and decode entities in attributes.
  const probe = decodeEntities(url).replace(/[\u0000- \u007f-\u009f]/g, "");
  if (!/^[a-z][a-z0-9+.-]*:/i.test(probe)) return true;
  return PROTOCOLS[kind].test(probe);
}

function escapeText(value: string): string {
  return value.replace(/&(?!#?[a-z0-9]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const STYLES: Record<string, RegExp> = {
  "text-align": /^(?:left|right|center|justify)$/i,
  color: /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|[a-z]+)$/i,
};

function cleanStyle(value: string): string | null {
  const kept = value.split(";").flatMap((rule) => {
    const index = rule.indexOf(":");
    if (index === -1) return [];
    const name = rule.slice(0, index).trim().toLowerCase();
    const setting = rule.slice(index + 1).trim();
    return STYLES[name]?.test(setting) ? [`${name}:${setting}`] : [];
  });
  return kept.length ? kept.join(";") : null;
}

const DIGITS = /^\d{1,4}$/;

// Allowed tags and, for each, the attributes it may keep and how each value is checked.
const TAGS: Record<string, Record<string, (value: string) => string | null>> = {};
const plain = "abbr b blockquote br caption code del details dd dl dt em figcaption figure h2 h3 h4 h5 h6 hr i ins kbd li mark ol pre q s small strong sub summary sup table tbody tfoot thead tr u ul";
for (const tag of plain.split(" ")) TAGS[tag] = {};
const styled = { style: cleanStyle };
const cell = { align: (v: string) => (/^(?:left|right|center)$/i.test(v) ? v : null), colspan: (v: string) => (DIGITS.test(v) ? v : null), rowspan: (v: string) => (DIGITS.test(v) ? v : null) };
Object.assign(TAGS, {
  p: styled,
  div: styled,
  span: styled,
  th: cell,
  td: cell,
  abbr: { title: (v: string) => v },
  details: { open: () => "" },
  ol: { start: (v: string) => (DIGITS.test(v) ? v : null) },
  a: { href: (v: string) => (safeUrl(v, "link") ? v : null), title: (v: string) => v },
  img: { src: (v: string) => (safeUrl(v, "image") ? v : null), alt: (v: string) => v, title: (v: string) => v, width: (v: string) => (DIGITS.test(v) ? v : null), height: (v: string) => (DIGITS.test(v) ? v : null) },
  audio: { src: (v: string) => (safeUrl(v, "audio") ? v : null), controls: () => "" },
});
const VOID = new Set(["br", "hr", "img"]);

// Elements whose content is code or markup rather than text: dropped whole.
const DROP = /<(script|style|iframe|object|embed|template|noscript|textarea|title|xmp|svg|math|frame|frameset|applet|noembed|plaintext)\b[\s\S]*?(?:<\/\1\s*>|$)/gi;
const TAG = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Rebuilds an HTML fragment from allowed tags and checked attributes. Everything else becomes text or is dropped. */
export function cleanHtml(fragment: string): string {
  const source = fragment.replace(DROP, "");
  let out = "";
  let last = 0;
  for (const match of source.matchAll(TAG)) {
    out += escapeText(source.slice(last, match.index));
    last = (match.index ?? 0) + match[0].length;
    const [, closing, rawName, rawAttrs] = match;
    if (!rawName) continue;
    const name = rawName.toLowerCase();
    const allowed = TAGS[name];
    if (!allowed) continue;
    if (closing) {
      if (!VOID.has(name)) out += `</${name}>`;
      continue;
    }
    let attrs = "";
    for (const attr of (rawAttrs ?? "").matchAll(ATTR)) {
      const key = attr[1]?.toLowerCase() ?? "";
      const check = allowed[key];
      if (!check) continue;
      const value = check(decodeEntities(attr[2] ?? attr[3] ?? attr[4] ?? ""));
      if (value === null) continue;
      attrs += value === "" && (key === "open" || key === "controls") ? ` ${key}` : ` ${key}="${escapeAttr(value)}"`;
    }
    out += `<${name}${attrs}>`;
  }
  return out + escapeText(source.slice(last));
}

export const markdown = new Marked();

markdown.use({
  renderer: {
    html({ text }) {
      return cleanHtml(text);
    },
    // Returning false keeps marked's own output for safe URLs.
    link({ href, tokens }) {
      if (safeUrl(href, "link")) return false;
      return this.parser.parseInline(tokens);
    },
    image({ href, text }) {
      if (safeUrl(href, "image")) return false;
      return escapeText(text);
    },
  },
});

export function renderMarkdown(source: string): string {
  return markdown.parse(source) as string;
}
