import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium, devices } from "playwright";

test("search is disabled while its client code is still loading", async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext(devices["iPhone 14"]);
  const page = await context.newPage();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const requested = page.waitForRequest("**/app-*.js", { timeout: 10000 });
  try {
    await page.route("**/app-*.js", async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(
      (process.env.UI_BASE_URL || "http://127.0.0.1:9000") + "/projects/",
      { waitUntil: "commit" },
    );
    await requested;
    const trigger = page.getByRole("button", {
      name: "검색 열기",
      exact: true,
    });
    await trigger.waitFor();
    assert.equal(await trigger.isDisabled(), true);
  } finally {
    release();
    await browser.close();
  }
});
