import { expect, type Locator, type Page } from "@playwright/test";

/** The phone this redesign is measured on (#288): 390 wide, an iPhone 14's height. */
export const PHONE = { width: 390, height: 844 };

/** Same hydration gate as sheet.spec.ts: an interaction before it never reaches Svelte. */
export async function gotoHome(page: Page) {
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');
}

/** WCAG 2.5.5 / the issue's criterion 3: every control is at least this big in both directions. */
export const MIN_TARGET = 44;

const CONTROLS = "a, button, select, input:not([type=file]), summary";

/**
 * Fails with the offending controls named, rather than a bare number, so a
 * red run says which button is too small.
 */
export async function expectTapTargets(scope: Locator) {
  const undersized = await scope.locator(CONTROLS).evaluateAll((elements, min) => {
    return elements.flatMap((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const hidden = style.visibility === "hidden" || style.display === "none" || box.width === 0;
      if (hidden) return [];
      if (box.width >= min && box.height >= min) return [];
      const name = element.getAttribute("aria-label") ?? element.textContent?.trim() ?? "";
      return [`${element.tagName.toLowerCase()} "${name.slice(0, 30)}" ${box.width}x${box.height}`];
    });
  }, MIN_TARGET);
  expect(undersized).toEqual([]);
}
