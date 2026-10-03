import { expect, type Locator, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";
import { expectTapTargets, gotoHome, PHONE } from "./mobile-support";

test.use({ viewport: PHONE });

/** Largest computed font size among the visible text in `scope`, minus the nodes in `except`. */
async function largestOtherFontSize(scope: Locator, except: Locator[]) {
  const skip = await Promise.all(except.map((locator) => locator.elementHandle()));
  return scope.evaluate((root, skipped) => {
    let largest = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node.parentElement;
      if (!element || !node.textContent?.trim()) continue;
      if (skipped.some((handle) => handle?.contains(element))) continue;
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      largest = Math.max(largest, Number.parseFloat(getComputedStyle(element).fontSize));
    }
    return largest;
  }, skip);
}

test("the card leads with programme, temperature and spin, and temperature and spin are its largest text", async ({
  page,
}) => {
  await gotoHome(page);
  const card = page.locator("article").first();
  const temperature = card.getByTestId("card-temperature");
  const spin = card.getByTestId("card-spin");

  await expect(card.getByTestId("card-programme")).toBeVisible();
  await expect(temperature).toBeVisible();
  await expect(spin).toBeVisible();

  const size = (locator: Locator) =>
    locator.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const other = await largestOtherFontSize(card, [temperature, spin]);
  expect(await size(temperature)).toBeGreaterThan(other);
  expect(await size(spin)).toBeGreaterThan(other);
});

test("the unit is never clipped: the temperature and spin read in full", async ({ page }) => {
  await gotoHome(page);
  const card = page.locator("article").first();

  await expect(card.getByTestId("card-temperature")).toHaveText(/^(\d+\s?°C|koud)$/);
  await expect(card.getByTestId("card-spin")).toHaveText(/^(\d+\srpm|No spin.*)$/i);
  for (const id of ["card-temperature", "card-spin"]) {
    const fits = await card
      .getByTestId(id)
      .evaluate((element) => element.scrollWidth <= element.clientWidth);
    expect(fits, `${id} overflows its box`).toBe(true);
  }
});

test("a card title wraps to at most two lines", async ({ page }) => {
  await gotoHome(page);
  for (const heading of await page.locator("article h3").all()) {
    const lines = await heading.evaluate((element) => {
      const style = getComputedStyle(element);
      return Math.round(
        element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight),
      );
    });
    expect(lines).toBeLessThanOrEqual(2);
  }
});

test("detergent, drying, ironing and notes are collapsed until asked for", async ({ page }) => {
  await gotoHome(page);
  const card = page.locator("article").first();
  const details = card.getByTestId("card-details");

  await expect(details).not.toHaveAttribute("open", "");
  await expect(card.getByText("DETERGENT", { exact: true })).toBeHidden();
  await expect(card.getByText("DRYING", { exact: true })).toBeHidden();

  await details.getByText("Details", { exact: true }).click();
  await expect(card.getByText("DETERGENT", { exact: true })).toBeVisible();
  await expect(card.getByText("DRYING", { exact: true })).toBeVisible();
  await expectNoA11yViolations(page);
});

test("every control on a card is at least 44x44, details closed and open", async ({ page }) => {
  await gotoHome(page);
  const card = page.locator("article").first();

  await expectTapTargets(card);
  await card.getByTestId("card-details").getByText("Details", { exact: true }).click();
  await expectTapTargets(card);
});
