import { test } from "node:test";
import assert from "node:assert/strict";
import { browserFixture, go } from "./browserFixture.mjs";
const withPage = browserFixture();

test("site search finds projects", () =>
  withPage(async (page) => {
    await go(page, "/projects/");
    await page.getByRole("button", { name: "검색 열기", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("searchbox").fill("A-VLAN");
    const result = dialog
      .getByRole("link")
      .filter({ hasText: "A-VLAN" })
      .first();
    await result.waitFor();
    assert.match(
      await result.getAttribute("href"),
      /\/projects\/avlan-aviation-ground-safety\//,
    );
  }));

test("site search exposes more than its first result batch", () =>
  withPage(async (page) => {
    await go(page, "/blog/");
    await page.getByRole("button", { name: "검색 열기", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("searchbox").fill("RAG");
    await dialog.getByRole("button", { name: /결과 더 보기/ }).click();
    assert.equal(await dialog.locator(".search-result").count(), 24);
  }));

test("a mobile evidence dialog keeps reverse tab focus inside", () =>
  withPage(async (page) => {
    await go(page, "/competitions/");
    await page
      .getByRole("button", { name: "수료증 →", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "증빙 팝업 닫기" }).focus();
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await page.evaluate(() =>
        Boolean(document.activeElement.closest("dialog[open]")),
      ),
      true,
    );
  }));

test("the mobile menu hides reel controls", () =>
  withPage(async (page) => {
    await go(page, "/");
    await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
    assert.equal(await page.locator(".reel .hud").isVisible(), false);
  }));

test("newsroom reports an empty search", () =>
  withPage(async (page) => {
    await go(page, "/newsroom/");
    await page
      .getByRole("searchbox", { name: "Newsroom 그래프 검색" })
      .fill("zzzz-no-such-paper-928374");
    await page
      .getByRole("status")
      .filter({ hasText: "검색 결과가 없습니다" })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "검색어 지우기", exact: true })
        .isVisible(),
      true,
    );
  }));

test("mobile tip metadata links have usable touch areas", () =>
  withPage(async (page) => {
    await go(page, "/tips/");
    const links = page.locator(".tip-row-links a");
    assert.ok(await links.count());
    for (const link of await links.all()) {
      const bounds = await link.boundingBox();
      assert.ok(bounds.height >= 43.9 && bounds.width >= 43.9);
    }
  }));
