// Generates public/og.png (1200x630) — the default social share image.
// Run with: bun scripts/generate-og.mjs
import sharp from "sharp";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F5F5F0"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#e0e0dc" stroke-width="2"/>
  <text x="96" y="300" font-family="Georgia, serif" font-style="italic" font-size="104" fill="#333333">Alok Kumar</text>
  <text x="100" y="380" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#888888">Product Designer</text>
  <text x="100" y="436" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#b0b0b0">Simplifying digital healthcare for all end-users</text>
  <text x="100" y="540" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#b0b0b0">designedbyalok.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/og.png");
console.log("Wrote public/og.png");
