import { test } from "node:test";
import assert from "node:assert/strict";
import { browserFixture, go } from "./browserFixture.mjs";
import { openGallery } from "./galleryFixture.mjs";
const withPage = browserFixture();

const article =
  "/blog/foundation-models/large-scale-model-core-techniques-report/";

test("article image reading supports zoom on a phone", () =>
  withPage(async (page) => {
    const dialog = await openGallery(page);
    const image = dialog
      .locator("img.pswp__img:not(.pswp__img--placeholder)")
      .first();
    const before = await image.boundingBox();
    await dialog
      .getByRole("button", { name: "이미지 확대", exact: true })
      .click();
    await page.waitForFunction(
      (width) =>
        document
          .querySelector("img.pswp__img:not(.pswp__img--placeholder)")
          .getBoundingClientRect().width >
        width + 10,
      before.width,
    );
    assert.ok((await image.boundingBox()).width > before.width + 10);
  }));

test("the fitted image stays between its controls", () =>
  withPage(async (page) => {
    await go(
      page,
      "/blog/search-retrieval/neomme-single-tower-visual-document-retrieval/",
    );
    await page
      .locator("main img.project-lightbox-trigger")
      .first()
      .press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "이미지 뷰어",
      exact: true,
    });
    await dialog
      .locator("img.pswp__img:not(.pswp__img--placeholder)")
      .waitFor();
    const bounds = await dialog
      .locator("img.pswp__img:not(.pswp__img--placeholder)")
      .first()
      .boundingBox();
    const header = await dialog.locator(".image-viewer-header").boundingBox();
    const footer = await dialog.locator(".image-viewer-bottom").boundingBox();
    assert.ok(bounds.y >= header.y + header.height - 1);
    assert.ok(bounds.y + bounds.height <= footer.y + 1);
  }));

test("viewer controls stay reachable on a narrow phone", () =>
  withPage(async (page) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const dialog = await openGallery(page);
    for (const control of await dialog
      .locator(".image-viewer-tools > *")
      .all()) {
      const bounds = await control.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 320);
    }
  }));

test("article image reading supports pinch zoom", () =>
  withPage(async (page, context) => {
    const dialog = await openGallery(page);
    const before = await dialog
      .locator("img.pswp__img:not(.pswp__img--placeholder)")
      .first()
      .boundingBox();
    const cdp = await context.newCDPSession(page);
    const y = 400;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: 160, y, id: 1 },
        { x: 230, y, id: 2 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 100, y, id: 1 },
        { x: 290, y, id: 2 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForFunction(
      (width) =>
        document
          .querySelector("img.pswp__img:not(.pswp__img--placeholder)")
          .getBoundingClientRect().width >
        width + 10,
      before.width,
    );
    assert.ok(
      (
        await dialog
          .locator("img.pswp__img:not(.pswp__img--placeholder)")
          .first()
          .boundingBox()
      ).width >
        before.width + 10,
    );
  }));

test("image reading can advance to another article image", () =>
  withPage(async (page) => {
    const dialog = await openGallery(page);
    await dialog
      .getByRole("button", { name: "다음 이미지", exact: true })
      .click();
    assert.equal(
      await dialog.locator(".image-viewer-count").textContent(),
      "2 / 5",
    );
  }));

test("rotating a portrait diagram preserves its aspect and fits the stage", () =>
  withPage(async (page) => {
    await go(
      page,
      "/blog/search-retrieval/neomme-single-tower-visual-document-retrieval/",
    );
    await page
      .locator("main img.project-lightbox-trigger")
      .first()
      .press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "이미지 뷰어",
      exact: true,
    });
    const image = dialog
      .locator("img.pswp__img:not(.pswp__img--placeholder)")
      .first();
    await image.waitFor();
    await dialog
      .getByRole("button", { name: "이미지 오른쪽으로 회전" })
      .click();
    await page.waitForFunction(() => {
      const r = document
        .querySelector("img.pswp__img:not(.pswp__img--placeholder)")
        .getBoundingClientRect();
      return r.width > r.height;
    });
    const bounds = await image.boundingBox();
    assert.ok(Math.abs(bounds.width / bounds.height - 1160 / 660) < 0.03);
    assert.ok(
      bounds.y >=
        (await dialog.locator(".image-viewer-header").boundingBox()).height - 1,
    );
  }));

test("closing image reading returns focus to its image", () =>
  withPage(async (page) => {
    await openGallery(page);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("dialog[open]"));
    assert.equal(
      await page.evaluate(() =>
        document.activeElement.matches("main img.project-lightbox-trigger"),
      ),
      true,
    );
  }));

test("a failed article image shows a useful error instead of a broken thumbnail", () =>
  withPage(async (page) => {
    await page.route("**/images/blog/large-model-transformer.png", (route) =>
      route.abort(),
    );
    await go(page, article);
    await page
      .locator(".article-image-error")
      .filter({ hasText: "Transformer Architecture" })
      .waitFor();
    assert.equal(
      await page
        .locator("main img[alt='Transformer Architecture']")
        .isVisible(),
      false,
    );
  }));

test("portfolio reading does not advance the presentation behind its dialog", () =>
  withPage(async (page) => {
    await go(page, "/portfolio/");
    await page
      .getByRole("button", { name: "확대해서 읽기", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "이미지 뷰어",
      exact: true,
    });
    await dialog
      .getByRole("button", { name: "다음 이미지", exact: true })
      .waitFor();
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await dialog.locator(".image-viewer-count").textContent(),
      "2 / 36",
    );
    assert.equal(
      (await page.locator(".deck-counter").textContent()).trim(),
      "001 / 036",
    );
  }));
