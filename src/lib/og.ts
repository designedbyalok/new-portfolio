import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Branded 1200x630 Open Graph card — warm dark palette, Averia serif title.
// Rendered at build time only (static endpoint), zero runtime cost.

const WIDTH = 1200;
const HEIGHT = 630;

let fontsPromise: Promise<{ serif: Buffer; sans: Buffer; sansMedium: Buffer }> | null = null;

function loadFonts() {
  // Resolved from the repo root — this endpoint only runs at build time,
  // where cwd is the project directory (locally and on Vercel).
  const fonts = join(process.cwd(), "node_modules/@fontsource");
  fontsPromise ??= (async () => {
    const [serif, sans, sansMedium] = await Promise.all([
      readFile(join(fonts, "averia-serif-libre/files/averia-serif-libre-latin-700-italic.woff")),
      readFile(join(fonts, "ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff")),
      readFile(join(fonts, "ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff")),
    ]);
    return { serif, sans, sansMedium };
  })();
  return fontsPromise;
}

const titleSize = (title: string) =>
  title.length > 80 ? 52 : title.length > 48 ? 60 : 76;

/** Render a branded OG card PNG for a page. */
export async function renderOgImage(
  title: string,
  eyebrow: string,
): Promise<Uint8Array> {
  const { serif, sans, sansMedium } = await loadFonts();

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#1B1917",
          fontFamily: "IBM Plex Sans",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#A69D8D",
              },
              children: eyebrow,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontFamily: "Averia Serif Libre",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: titleSize(title),
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "#FCF2E1",
                maxWidth: "1000px",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: 28, color: "#FCF2E1", fontWeight: 500 },
                    children: "Alok Kumar",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: 26, color: "#756c5e" },
                    children: "designedbyalok.com",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Averia Serif Libre", data: serif, weight: 700, style: "italic" },
        { name: "IBM Plex Sans", data: sans, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: sansMedium, weight: 500, style: "normal" },
      ],
    },
  );

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
    .render()
    .asPng();
  return png;
}
