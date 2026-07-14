import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:9000/";
const formerlyInflatedLabels = [
  "Agent Orchestration",
  "Github Actions",
  "Graph Optimization",
];

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    deviceScaleFactor: 3,
    isMobile: true,
    viewport: { width: 393, height: 852 },
  });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: "load" });
  await page.locator(".mobile-skill-grid").waitFor({ state: "visible" });

  const labels = await page
    .locator(".mobile-skill-grid .skill-logo-name")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const item = node.closest("li");
        const style = getComputedStyle(node);

        return {
          fontSize: style.fontSize,
          gridColumn: item ? getComputedStyle(item).gridColumn : null,
          name: (node.textContent ?? "").trim(),
          textSizeAdjust: style.textSizeAdjust,
        };
      }),
    );

  assert(labels.length > 0, "mobile skill labels must render");
  const fontSizes = [...new Set(labels.map(({ fontSize }) => fontSize))];

  assert.equal(
    fontSizes.length,
    1,
    `every mobile skill label must keep one type scale; found ${fontSizes.join(", ")}`,
  );
  assert(
    labels.every(({ textSizeAdjust }) => textSizeAdjust === "100%"),
    "mobile skill labels must disable per-row automatic text inflation",
  );

  const fullWidthLabels = labels
    .filter(({ gridColumn }) => gridColumn === "1 / -1")
    .map(({ name }) => name);

  assert(
    formerlyInflatedLabels.every((name) => fullWidthLabels.includes(name)),
    "the regression fixture must include the odd final rows that span both columns",
  );
} finally {
  await browser.close();
}
