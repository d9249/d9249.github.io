import { before, after } from "node:test";
import { chromium, devices } from "playwright";
const base = process.env.UI_BASE_URL || "http://127.0.0.1:9000";
export function browserFixture() {
  let browser;
  before(async () => {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  });
  after(async () => {
    await browser?.close();
  });
  return async (run) => {
    const context = await browser.newContext({
      ...devices["iPhone 14"],
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    try {
      await run(page, context);
    } finally {
      await context.close();
    }
  };
}
export async function go(page, path) {
  await page.goto(base + path);
  await page.locator(".search-toggle:not([disabled])").waitFor();
}
