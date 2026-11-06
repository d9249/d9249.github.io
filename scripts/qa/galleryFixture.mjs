import { go } from "./browserFixture.mjs";
const article =
  "/blog/foundation-models/large-scale-model-core-techniques-report/";
export async function openGallery(page, path = article) {
  await go(page, path);
  const image = page.locator("main img.project-lightbox-trigger").first();
  await image.waitFor();
  await image.press("Enter");
  const dialog = page.getByRole("dialog", { name: "이미지 뷰어", exact: true });
  await dialog
    .getByRole("button", { name: "이미지 확대", exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector("img.pswp__img:not(.pswp__img--placeholder)")
        ?.complete &&
      !document.querySelector('button[aria-label="이미지 확대"]')?.disabled,
  );
  return dialog;
}
