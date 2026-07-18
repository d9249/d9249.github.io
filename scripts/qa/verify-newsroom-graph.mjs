import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:9000/";

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // The newsroom tab must exist in the primary navigation.
  await page.goto(baseUrl, { waitUntil: "load" });
  const navLink = page.locator(
    'nav[aria-label="Primary navigation"] a[href="/newsroom/"]',
  );
  assert.equal(await navLink.count(), 1, "navbar must expose a newsroom tab");

  await page.goto(`${baseUrl}newsroom/`, { waitUntil: "load" });
  await page.locator(".newsroom-canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(1200);

  // Stats must report a populated graph.
  const stats = await page
    .locator(".newsroom-stats span")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));
  const pages = Number.parseInt(
    stats.find((text) => text.includes("pages")) ?? "0",
    10,
  );
  const links = Number.parseInt(
    stats.find((text) => text.includes("links")) ?? "0",
    10,
  );

  assert(pages > 300, `graph must include the full corpus; saw ${pages} pages`);
  assert(links > pages / 2, `graph must be connected; saw ${links} links`);

  // The canvas must actually have drawn pixels.
  const drawnPixels = await page
    .locator(".newsroom-canvas")
    .evaluate((canvas) => {
      const context = canvas.getContext("2d");
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
          painted += 1;
        }
      }

      return painted;
    });
  assert(
    drawnPixels > 5000,
    `canvas must render the graph; painted ${drawnPixels}px`,
  );

  // Legend chips mirror the curated cluster labels.
  const legendCount = await page.locator(".newsroom-legend-chip").count();
  assert(legendCount >= 10, `legend must list clusters; saw ${legendCount}`);

  // Searching then selecting must open the detail panel with a post link.
  await page.locator(".newsroom-search").fill("claude");
  await page.waitForTimeout(300);

  // Click a node: probe canvas center region for a hit by clicking the
  // densest cluster area (canvas hit-testing is internal, so click until
  // the panel opens or fall back to a few sampled points).
  const shell = page.locator(".newsroom-canvas-shell");
  const box = await shell.boundingBox();
  const samples = [
    [0.5, 0.5],
    [0.42, 0.44],
    [0.58, 0.4],
    [0.36, 0.6],
    [0.64, 0.62],
    [0.5, 0.32],
    [0.3, 0.42],
    [0.7, 0.5],
    [0.45, 0.7],
    [0.55, 0.55],
  ];
  let panelOpened = false;

  for (const [fx, fy] of samples) {
    await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await page.waitForTimeout(200);

    if (await page.locator(".newsroom-panel-link").isVisible()) {
      panelOpened = true;
      break;
    }
  }

  assert(panelOpened, "clicking a node must open the detail panel");

  const href = await page.locator(".newsroom-panel-link").getAttribute("href");
  assert(
    /^\/(blog|tips)\//.test(href ?? ""),
    `panel link must target a blog or tip post; saw ${href}`,
  );

  // Following the link must land on the actual article.
  await page.locator(".newsroom-panel-link").click();
  await page.waitForURL(`**${href}`);
  assert(
    new URL(page.url()).pathname === href,
    "panel link must navigate to the article",
  );
} finally {
  await browser.close();
}
