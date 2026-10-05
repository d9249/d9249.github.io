// Renders the site mark into the raster icons browsers and home screens ask for.
//
//   node scripts/brand/build-icons.mjs
//
// Sources (edit these, then re-run):
//   scripts/brand/mark.svg   master drawing — 64px and up
//   static/favicon.svg       small optical size — 16px / 32px, served as the tab icon
//
// Writes to static/:
//   favicon.ico              16 · 32 · 48, from favicon.svg (browsers that skip SVG icons)
//   apple-touch-icon.png     180, full-bleed paper (iOS rounds the corners itself)
//   icon-192.png, icon-512.png       rounded tile, transparent corners (manifest, "any")
//   icon-maskable-512.png    full-bleed, glyph inside the 80% safe circle (manifest, "maskable")
//
// Uses the repo's Playwright. If its bundled Chromium is missing, point CHROMIUM_PATH at one.

import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const out = (name) => path.join(root, "static", name);

const master = await readFile(
  path.join(root, "scripts/brand/mark.svg"),
  "utf8",
);
const small = await readFile(out("favicon.svg"), "utf8");

// full-bleed tile (no corner radius) and a glyph scaled about the centre
const fullBleed = (svg) =>
  svg.replace(/(<rect id="tile"[^>]*?) rx="[\d.]+"/, "$1");
const scaled = (svg, k) =>
  svg.replace(
    '<g id="glyph">',
    `<g id="glyph" transform="translate(32 32) scale(${k}) translate(-32 -32)">`,
  );

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {},
);
const page = await browser.newPage();

const png = async (svg, size) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  return page.screenshot({ omitBackground: true, type: "png" });
};

// ICO with PNG payloads (Vista+ / every current browser)
const ico = (images) => {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
};

const icoImages = [];
for (const size of [16, 32, 48]) {
  icoImages.push({ size, data: await png(size >= 48 ? master : small, size) });
}
await writeFile(out("favicon.ico"), ico(icoImages));
await writeFile(out("apple-touch-icon.png"), await png(fullBleed(master), 180));
await writeFile(out("icon-192.png"), await png(master, 192));
await writeFile(out("icon-512.png"), await png(master, 512));
await writeFile(
  out("icon-maskable-512.png"),
  await png(scaled(fullBleed(master), 0.84), 512),
);

await browser.close();
console.log(
  "favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png → static/",
);
