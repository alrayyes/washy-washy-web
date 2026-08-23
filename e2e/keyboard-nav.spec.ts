import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

/**
 * Reused across pages by construction (`KeyboardNav.tsx` mounts once, in
 * `SiteHeader`) — most of these run against the front page, which has both
 * a search-style field (`/`'s target) and enough content to scroll, and one
 * test confirms the same bindings reach `/config` too, proving this isn't
 * something the front page alone got wired up for (#133).
 */
async function goto(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForSelector('[data-testid="keyboard-help-trigger"]');
}

async function scrollY(page: Page) {
  return page.evaluate(() => window.scrollY);
}

test("j scrolls down and k scrolls back up", async ({ page }) => {
  await goto(page);
  expect(await scrollY(page)).toBe(0);

  await page.keyboard.press("j");
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  const afterJ = await scrollY(page);

  await page.keyboard.press("k");
  await expect.poll(() => scrollY(page)).toBeLessThan(afterJ);
});

test("gg jumps to the top and G jumps to the bottom", async ({ page }) => {
  await goto(page);
  await page.evaluate(() => window.scrollTo({ top: 300 }));
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0);

  await page.keyboard.press("g");
  await page.keyboard.press("g");
  await expect.poll(() => scrollY(page)).toBe(0);

  await page.keyboard.press("G");
  await expect
    .poll(() =>
      page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1,
      ),
    )
    .toBe(true);
});

test("two g presses too far apart don't count as gg", async ({ page }) => {
  await goto(page);
  await page.evaluate(() => window.scrollTo({ top: 300 }));
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0);

  await page.keyboard.press("g");
  await page.waitForTimeout(700);
  await page.keyboard.press("g");

  // Neither press alone does anything on its own — the page should still
  // be wherever it was scrolled to, not at the top.
  await page.waitForTimeout(200);
  expect(await scrollY(page)).toBeGreaterThan(0);
});

test("/ focuses the pile search field without typing a slash into it", async ({ page }) => {
  await goto(page);

  await page.keyboard.press("/");

  await expect(page.locator("#filter-pile")).toBeFocused();
  await expect(page.locator("#filter-pile")).toHaveValue("");
});

test("the bindings do nothing while a text field already has focus", async ({ page }) => {
  await goto(page);
  await page.locator("#filter-pile").focus();

  await page.keyboard.press("j");

  expect(await scrollY(page)).toBe(0);
  // The keypress reached the field as ordinary typing, not a binding —
  // "j" landed in the value instead of scrolling the page.
  await expect(page.locator("#filter-pile")).toHaveValue("j");
});

test("Shift-? opens a help overlay listing every binding, and it passes an accessibility scan", async ({
  page,
}) => {
  await goto(page);

  await page.keyboard.press("?");

  const dialog = page.getByTestId("keyboard-help-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Scroll down");
  await expect(dialog).toContainText("Jump to the top");
  await expect(dialog).toContainText("Jump to the bottom");
  await expect(dialog).toContainText("Focus the page's search field");
  await expectNoA11yViolations(page);
});

test("Escape closes the help overlay", async ({ page }) => {
  await goto(page);
  await page.keyboard.press("?");
  const dialog = page.getByTestId("keyboard-help-dialog");
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
});

test("clicking outside the help overlay closes it, clicking inside doesn't", async ({ page }) => {
  await goto(page);
  await page.keyboard.press("?");
  const dialog = page.getByTestId("keyboard-help-dialog");
  await expect(dialog).toBeVisible();

  // Inside the dialog's own content — shouldn't close it.
  await dialog.getByText("Keyboard shortcuts", { exact: true }).click();
  await expect(dialog).toBeVisible();

  // The dialog element's own box, outside the content wrapper — its
  // "backdrop" area for click purposes.
  const box = await dialog.boundingBox();
  await page.mouse.click((box?.x ?? 0) + 2, (box?.y ?? 0) + 2);
  await expect(dialog).toBeHidden();
});

test("the visible ? button opens the same overlay, for a mouse or screen-reader user", async ({
  page,
}) => {
  await goto(page);

  await page.getByTestId("keyboard-help-trigger").click();

  await expect(page.getByTestId("keyboard-help-dialog")).toBeVisible();
});

test("the bindings reach other pages too, not just the front page", async ({ page }) => {
  await goto(page, "/config");

  await page.keyboard.press("?");

  await expect(page.getByTestId("keyboard-help-dialog")).toBeVisible();
});
