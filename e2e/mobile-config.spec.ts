import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";
import { expectTapTargets, PHONE } from "./mobile-support";

test.use({ viewport: PHONE });

/** Same hydration gate as config.spec.ts: an interaction before it never reaches Svelte. */
async function gotoConfig(page: Page) {
  await page.goto("/config");
  await page.waitForSelector('[data-hydrated="true"]');
}

const firstCard = (page: Page) => page.locator('[data-testid="chart-cards"] > article').first();

test("an editable card groups programme, temperature and spin, and puts them first (#302)", async ({
  page,
}) => {
  await gotoConfig(page);
  const card = firstCard(page);
  const settings = card.getByTestId("card-settings");

  await expect(settings.getByRole("combobox", { name: "Programme" })).toBeVisible();
  await expect(settings.getByRole("radiogroup", { name: "Temp" })).toBeVisible();
  await expect(settings.getByRole("radiogroup", { name: /^Spin/ })).toBeVisible();

  // Everything else on the card sits below the group, so the three read first.
  const bottom = await settings.evaluate((el) => el.getBoundingClientRect().bottom);
  const later = card.locator(
    'textarea[name="detergent"], [data-testid="toggle-fabric_softener"], [data-testid="toggle-ironing"], [data-testid^="chip-colour_group-"]',
  );
  expect(await later.count()).toBeGreaterThan(0);
  for (const top of await later.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().top),
  )) {
    expect(top).toBeGreaterThanOrEqual(bottom);
  }
});

test("every other field stays open and reachable without extra taps (#302)", async ({ page }) => {
  await gotoConfig(page);
  const card = firstCard(page);

  await expect(card.locator("details")).toHaveCount(0);
  for (const name of ["detergent", "drying", "notes", "ironing_notes"]) {
    await expect(card.locator(`textarea[name="${name}"]`)).toBeVisible();
  }
});

test("every control on a /config card is at least 44x44 at 390px (#302)", async ({ page }) => {
  await gotoConfig(page);
  await expectTapTargets(firstCard(page));
});

test("the page never scrolls sideways at 390px", async ({ page }) => {
  await gotoConfig(page);
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(fits).toBe(true);
});

test("the axe scan passes on /config at 390px", async ({ page }) => {
  await gotoConfig(page);
  await expectNoA11yViolations(page);
});
