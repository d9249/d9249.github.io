import { test } from "node:test";
import assert from "node:assert/strict";
import { browserFixture, go } from "./browserFixture.mjs";
import { openGallery } from "./galleryFixture.mjs";

const withPage = browserFixture();
const article =
  "/blog/foundation-models/large-scale-model-core-techniques-report/";
const diagram =
  "/blog/search-retrieval/neomme-single-tower-visual-document-retrieval/";

test("a viewer download failure retains the article and can recover on reopening", () =>
  withPage(async (page) => {
    let offline = false;
    await page.route("**/*.js", (route) =>
      offline ? route.abort() : route.continue(),
    );
    await go(page, article);
    const image = page.locator("main img.project-lightbox-trigger").first();
    await image.waitFor();
    const source = await image.evaluate((element) => element.currentSrc);
    offline = true;
    await image.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "이미지 뷰어",
      exact: true,
    });
    await dialog.getByRole("alert").waitFor({ timeout: 10000 });
    assert.equal(await page.locator("main").count(), 1);
    assert.equal(
      await dialog
        .getByRole("link", { name: "원본 이미지 보기" })
        .getAttribute("href"),
      source,
    );
    await dialog.getByRole("button", { name: "닫기", exact: true }).click();
    assert.ok(
      await image.evaluate((element) => document.activeElement === element),
    );
    offline = false;
    await image.press("Enter");
    await dialog
      .getByRole("button", { name: "이미지 확대", exact: true })
      .waitFor();
    assert.equal(await page.locator("main").count(), 1);
  }));

test("hiding reader controls keeps a visible focused exit", () =>
  withPage(async (page) => {
    const dialog = await openGallery(page);
    await dialog
      .getByRole("button", { name: "이미지 확대", exact: true })
      .focus();
    await dialog
      .locator("img.pswp__img:not(.pswp__img--placeholder)")
      .first()
      .click();
    await dialog.locator(".image-viewer-bottom.is-hidden").waitFor();
    const close = dialog.getByRole("button", {
      name: "이미지 뷰어 닫기",
      exact: true,
    });
    assert.ok(await close.isVisible());
    assert.ok(
      await close.evaluate((element) => document.activeElement === element),
    );
    await page.keyboard.press("Tab");
    assert.ok(
      await close.evaluate((element) => document.activeElement === element),
    );
    await close.click();
    await page.waitForFunction(() => !document.querySelector("dialog[open]"));
  }));

test("long image descriptions expand without covering the fitted diagram", () =>
  withPage(async (page) => {
    const dialog = await openGallery(page, diagram);
    const description = dialog.locator(".image-viewer-description");
    const summary = description.locator("summary");
    await summary.waitFor({ timeout: 5000 });
    await summary.press("Enter");
    assert.ok(await description.evaluate((element) => element.open));
    const caption = description.locator(".image-viewer-caption");
    assert.ok(
      await caption.evaluate(
        (element) => element.scrollHeight <= element.clientHeight + 1,
      ),
    );
    await page.waitForFunction(() => {
      const image = document.querySelector(
        "img.pswp__img:not(.pswp__img--placeholder)",
      );
      const header = document.querySelector(".image-viewer-header");
      const footer = document.querySelector(".image-viewer-bottom");
      if (!image) return false;
      const bounds = image.getBoundingClientRect();
      return (
        bounds.y >= header.getBoundingClientRect().bottom &&
        bounds.bottom <= footer.getBoundingClientRect().top
      );
    });
    await summary.press("Enter");
    assert.equal(await description.evaluate((element) => element.open), false);
  }));

test("mobile article metadata retains every reading-time glyph", () =>
  withPage(async (page) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      for (const theme of ["light", "dark"]) {
        for (const path of [
          "/blog/evaluation-benchmarks/deepeval-local-first-llm-evaluation-framework/",
          "/blog/foundation-models/mistral-medium-3-5-unified-agentic-model/",
          "/blog/agent-skills-workflows/understand-anything-interactive-codebase-knowledge-graph/",
        ]) {
          await go(page, path);
          await page.evaluate((value) => {
            document.documentElement.dataset.theme = value;
          }, theme);
          const fits = await page
            .locator(".article-slate")
            .evaluate((slate) => {
              const bounds = slate.getBoundingClientRect();
              return [...slate.children].every((segment) => {
                const range = document.createRange();
                range.selectNodeContents(segment);
                return [...range.getClientRects()].every(
                  (rect) =>
                    rect.left >= bounds.left &&
                    rect.right <= bounds.right &&
                    rect.bottom <= bounds.bottom,
                );
              });
            });
          assert.ok(fits, `${width} ${theme} ${path}`);
        }
      }
    }
  }));
