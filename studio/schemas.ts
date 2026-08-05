// All portfolio content types. Field names mirror the site's metadata
// interfaces in src/lib/*.ts — keep them in sync.
import { BookAutofill, FilmAutofill } from "./components/AutofillInput";

// A search box at the top of the form that fills the fields below it.
const bookLookup = {
  name: "lookup",
  title: "Search & auto-fill",
  type: "string",
  description:
    "Type a book title, pick a result — title, author and slug fill in below. The cover is fetched automatically on publish.",
  components: { input: BookAutofill },
};
const filmLookup = {
  name: "lookup",
  title: "Search & auto-fill",
  type: "string",
  description:
    "Type a film title, pick a result — title, director, year and slug fill in below. The poster is fetched automatically on publish.",
  components: { input: FilmAutofill },
};

const slug = {
  name: "slug",
  type: "slug",
  options: { source: "title", maxLength: 96 },
  validation: (r: any) => r.required(),
};
const body = { name: "body", type: "markdown", title: "Body" };
const photoArray = {
  name: "photos",
  type: "array",
  of: [
    {
      type: "object",
      fields: [
        { name: "image", type: "image", options: { hotspot: true } },
        { name: "caption", type: "string" },
        { name: "aspect", type: "string", initialValue: "3 / 2" },
      ],
      preview: { select: { title: "caption", media: "image" } },
    },
  ],
};

export const schemaTypes = [
  {
    name: "post",
    title: "Blog post",
    type: "document",
    fields: [
      { name: "title", type: "string", validation: (r: any) => r.required() },
      slug,
      { name: "seoDescription", type: "text", rows: 2, description: "≤160 chars for meta description" },
      { name: "thumbnail", type: "image", options: { hotspot: true } },
      { name: "publishedAt", type: "datetime", validation: (r: any) => r.required() },
      body,
    ],
  },
  {
    name: "book",
    title: "Book",
    type: "document",
    fields: [
      bookLookup,
      { name: "title", type: "string", validation: (r: any) => r.required() },
      slug,
      { name: "author", type: "string", validation: (r: any) => r.required() },
      {
        name: "status",
        type: "string",
        options: {
          list: ["currently-reading", "finished", "paused", "abandoned", "wishlist"],
          layout: "radio",
        },
        initialValue: "currently-reading",
      },
      { name: "rating", type: "number", validation: (r: any) => r.min(1).max(5) },
      { name: "startedAt", type: "date" },
      { name: "finishedAt", type: "date" },
      { name: "spineColor", type: "string", initialValue: "#333333", description: "Hex color for the shelf spine" },
      { name: "textColor", type: "string", initialValue: "#ffffff" },
      { name: "cover", type: "image" },
      { name: "review", type: "text", rows: 3 },
      { name: "favoriteQuote", type: "text", rows: 2 },
      { name: "whyItMatters", type: "text", rows: 2 },
      body,
    ],
    preview: { select: { title: "title", subtitle: "author", media: "cover" } },
  },
  {
    name: "film",
    title: "Film",
    type: "document",
    fields: [
      filmLookup,
      { name: "title", type: "string", validation: (r: any) => r.required() },
      slug,
      { name: "year", type: "number", validation: (r: any) => r.required() },
      { name: "director", type: "string" },
      { name: "rating", type: "number", validation: (r: any) => r.min(0).max(5), description: "Halves allowed, e.g. 4.5" },
      { name: "watchedAt", type: "date" },
      { name: "poster", type: "image" },
      { name: "review", type: "text", rows: 3 },
      { name: "favoriteMoment", type: "text", rows: 2 },
      { name: "recommendedFor", type: "text", rows: 2 },
      { name: "lists", type: "array", of: [{ type: "string" }], description: "e.g. Comfort Films, Favorite Sci-Fi" },
      body,
    ],
    preview: { select: { title: "title", subtitle: "director", media: "poster" } },
  },
  {
    name: "archiveEntry",
    title: "Archive entry",
    type: "document",
    fields: [
      { name: "title", type: "string", validation: (r: any) => r.required() },
      slug,
      {
        name: "type",
        type: "string",
        options: { list: ["note", "quote", "mental-model", "framework", "observation"], layout: "radio" },
        initialValue: "note",
      },
      { name: "date", type: "date" },
      { name: "source", type: "string" },
      { name: "tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
      body,
    ],
  },
  {
    name: "work",
    title: "Work / Project",
    type: "document",
    fields: [
      { name: "company", type: "string", validation: (r: any) => r.required() },
      {
        name: "kind",
        type: "string",
        description: "experience = employment (Work Experience page); project = personal product (Projects page)",
        options: { list: ["experience", "project"], layout: "radio" },
        initialValue: "experience",
      },
      { ...slug, options: { source: "company", maxLength: 96 } },
      { name: "role", type: "string" },
      { name: "period", type: "string", description: 'e.g. "Jun 2023 — Present"' },
      { name: "summary", type: "text", rows: 3 },
      { name: "website", type: "url" },
      { name: "order", type: "number", initialValue: 0, description: "Higher = listed first" },
      {
        name: "caseStudies",
        title: "Case studies",
        type: "array",
        description: "Related case studies, shown on this work page in this order",
        of: [{ type: "reference", to: [{ type: "idea" }] }],
      },
      { name: "hero", type: "image", options: { hotspot: true } },
      { name: "logo", type: "image" },
      photoArray,
      {
        name: "projects",
        title: "Key metrics",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              { name: "title", type: "string" },
              { name: "description", type: "string" },
              { name: "href", type: "url" },
            ],
          },
        ],
      },
      {
        name: "testimonial",
        type: "object",
        fields: [
          { name: "quote", type: "text", rows: 3 },
          { name: "author", type: "string" },
          { name: "role", type: "string" },
        ],
      },
      body,
    ],
    preview: { select: { title: "company", subtitle: "period", media: "logo" } },
  },
  {
    name: "idea", // kept for data compatibility — these are the Case studies
    title: "Case study",
    type: "document",
    fields: [
      { name: "title", type: "string", validation: (r: any) => r.required() },
      slug,
      { name: "tagline", type: "string", validation: (r: any) => r.required() },
      { name: "period", type: "string" },
      { name: "role", type: "string" },
      { name: "tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
      { name: "hero", type: "image", options: { hotspot: true } },
      { name: "external", type: "url", title: "Live project URL" },
      { name: "order", type: "number", initialValue: 0, description: "Lower = listed first" },
      { name: "idea", type: "text", rows: 2 },
      { name: "problem", type: "text", rows: 3 },
      { name: "solution", type: "text", rows: 3 },
      { name: "whyUnique", type: "text", rows: 3 },
      photoArray,
      body,
    ],
    preview: { select: { title: "title", subtitle: "tagline", media: "hero" } },
  },
  {
    name: "photo",
    title: "Photo",
    type: "document",
    fields: [
      { name: "image", type: "image", options: { hotspot: true }, validation: (r: any) => r.required() },
      { name: "caption", type: "string" },
      { name: "alt", type: "string" },
      { name: "aspect", type: "string", initialValue: "3 / 2", description: 'CSS aspect ratio, e.g. "4 / 5"' },
      { name: "takenAt", type: "date" },
      { name: "location", type: "string" },
    ],
    preview: { select: { title: "caption", subtitle: "location", media: "image" } },
  },
];
