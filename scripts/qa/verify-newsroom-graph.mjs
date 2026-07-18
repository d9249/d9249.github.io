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

  // Stats must report a populated graph in the shared blog summary style.
  const summary = await page
    .locator(".blog-list-summary .blog-list-count")
    .innerText();
  const [pages, links] = summary
    .match(/\d+/g)
    .map((value) => Number.parseInt(value, 10));

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

  // Cluster nav must reuse the site chip pattern: All + one chip per cluster.
  const clusterChips = page.locator(
    ".newsroom-cluster-nav .category-nav-list a",
  );
  const chipCount = await clusterChips.count();
  assert(chipCount >= 11, `cluster nav must list clusters; saw ${chipCount}`);
  assert.equal(
    await clusterChips.first().innerText(),
    "All",
    "cluster nav must start with an All chip",
  );

  // Selecting a cluster chip must activate it (single-active semantics).
  await clusterChips.nth(1).click();
  await page.waitForTimeout(300);
  assert.equal(
    await clusterChips.nth(1).getAttribute("aria-pressed"),
    "true",
    "clicking a cluster chip must activate it",
  );
  await clusterChips.first().click();
  await page.waitForTimeout(300);

  // Search must surface a results dropdown that jumps to the node.
  await page.locator(".newsroom-search").fill("claude");
  await page.locator(".newsroom-search-results button").first().waitFor({
    state: "visible",
  });
  const firstResultTitle = await page
    .locator(".newsroom-search-results button span")
    .first()
    .innerText();
  await page.locator(".newsroom-search-results button").first().click();
  await page.waitForTimeout(400);

  const panelTitle = await page.locator(".newsroom-panel-title").innerText();
  assert(
    firstResultTitle.replace(/…$/, "").startsWith(panelTitle.slice(0, 20)) ||
      panelTitle.startsWith(firstResultTitle.replace(/…$/, "").slice(0, 20)),
    `search result must select its node; result "${firstResultTitle}" vs panel "${panelTitle}"`,
  );

  const href = await page.locator(".newsroom-panel-link").getAttribute("href");
  assert(
    /^\/(blog|tips)\//.test(href ?? ""),
    `panel link must target a blog or tip post; saw ${href}`,
  );

  // Clicking a canvas node directly must also open the panel.
  await page.locator(".newsroom-search").fill("");
  await page.keyboard.press("Escape");
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

  assert(panelOpened, "clicking a canvas node must open the detail panel");

  // Following the link must land on the actual article.
  const articleHref = await page
    .locator(".newsroom-panel-link")
    .getAttribute("href");
  await page.locator(".newsroom-panel-link").click();
  await page.waitForURL(`**${articleHref}`);
  assert(
    new URL(page.url()).pathname === articleHref,
    "panel link must navigate to the article",
  );
} finally {
  await browser.close();
}
