import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

/**
 * See `sheet.spec.ts` for why every navigation waits on `data-hydrated`
 * before interacting — the same island-hydration race applies here.
 */
async function goto(page: Page) {
  await page.goto("/config/machine");
  await page.waitForSelector('[data-hydrated="true"]');
}

test("shows the bundled washer and iron settings", async ({ page }) => {
  await goto(page);

  await expect(page.locator("#washer-name")).toHaveValue(/Generic front loader/);
  await expect(page.locator("#iron-name")).toHaveValue(/Generic steam iron/);
  await expectNoA11yViolations(page);
});

test("every washer field and the iron settings table is reachable by heading navigation", async ({
  page,
}) => {
  await goto(page);

  const h3s = await page.getByRole("heading", { level: 3 }).allTextContents();
  expect(h3s).toEqual(["Programmes", "Temperatures (°C)", "Spin speeds", "Buttons", "Settings"]);
});

test("adding, reordering and removing a programme", async ({ page }) => {
  await goto(page);

  const section = page.getByTestId("list-editor-programmes");
  const input = section.getByLabel(/Add to Programmes/);

  await input.fill("E2E Programme");
  await input.press("Enter");
  await expect(section.getByText("E2E Programme")).toBeVisible();

  // Move it to the top, then confirm it's genuinely first, not just present.
  const item = section.locator("li", { hasText: "E2E Programme" });
  const upBefore = await section.locator("li").allInnerTexts();
  await item.getByRole("button", { name: /Move E2E Programme up/ }).click();
  const upAfter = await section.locator("li").allInnerTexts();
  expect(upAfter).not.toEqual(upBefore);

  await item.getByRole("button", { name: /Remove E2E Programme/ }).click();
  await expect(section.getByText("E2E Programme")).toHaveCount(0);
});

test("an edit that breaks the chart's validity against the machine is called out", async ({
  page,
}) => {
  await goto(page);

  // The bundled chart's first row uses "Cottons" (data/washy-washy.json.dist).
  // Remove just that one programme via its own Remove button, keeping the
  // rest — a row-level mismatch, not the machine itself failing to parse.
  const section = page.getByTestId("list-editor-programmes");
  await section.getByRole("button", { name: "Remove Cottons", exact: true }).click();

  await page.getByRole("button", { name: /Save changes/ }).click();

  await expect(page.getByRole("alert")).toContainText(/row \d+, column "program"/);
  // The bad edit never took: still the bundled machine, not a half-applied one.
  await expect(page.getByText("Showing the bundled example machine.")).toBeVisible();
});

test("editing the washer and saving applies across the site", async ({ page }) => {
  await goto(page);

  await page.locator("#washer-name").fill("E2E Custom Washer");
  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByText("Showing your own machine.")).toBeVisible();

  await page.goto("/config");
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(page.getByText("E2E Custom Washer")).toBeVisible();
});

test("resetting to the bundled machine preserves the active chart", async ({ page }) => {
  // Edit the chart on /config first, so there's something to preserve.
  await page.goto("/config");
  await page.waitForSelector('[data-hydrated="true"]');
  const notesInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .locator('textarea[name="notes"]');
  await notesInput.fill("Preserved E2E note");
  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByText("Showing your own config.")).toBeVisible();

  await goto(page);
  await page.locator("#washer-name").fill("A Name That Gets Reset");
  await page.getByRole("button", { name: /Save changes/ }).click();
  await page.getByRole("button", { name: /Use the bundled machine instead/ }).click();
  await expect(page.getByText("Showing the bundled example machine.")).toBeVisible();

  await page.goto("/config");
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(
    page.locator('[data-testid="chart-cards"] > article').first().locator('textarea[name="notes"]'),
  ).toHaveValue("Preserved E2E note");
});

test("below sm: the iron settings render as cards, not the table, and never force horizontal scroll", async ({
  page,
}) => {
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 800 });
    await goto(page);

    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      )
      .toBe(true);

    await expect(page.getByTestId("iron-settings-table")).toBeHidden();
    await expect(page.getByTestId("iron-settings-cards")).toBeVisible();
    await expectNoA11yViolations(page);
  }
});

test("at sm: and above the iron settings render as the table, cards hidden", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 });
  await goto(page);

  await expect(page.getByTestId("iron-settings-table")).toBeVisible();
  await expect(page.getByTestId("iron-settings-cards")).toBeHidden();

  // The table itself still scrolls within its own bounded container if
  // it's ever wider than its ancestor — this isn't meant to make the
  // table narrower, just to stop it widening the page (#47).
  const wrapper = page.getByTestId("iron-settings-table");
  await expect
    .poll(() => wrapper.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
    .toBe(true);
});

test("editing an iron setting through the mobile card layout behaves identically to the table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await goto(page);

  const cards = page.getByTestId("iron-settings-cards");
  await cards.getByLabel("Setting 1 label").fill("E2E Mobile Setting");
  await cards.getByLabel("Setting 1 makes steam").check();

  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByText("Showing your own machine.")).toBeVisible();

  // Same state the table's Save would have written — persists to the
  // same localStorage config, so a reload shows it back through the
  // very card layout that wrote it.
  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(page.getByTestId("iron-settings-cards").getByLabel("Setting 1 label")).toHaveValue(
    "E2E Mobile Setting",
  );
  await expect(
    page.getByTestId("iron-settings-cards").getByLabel("Setting 1 makes steam"),
  ).toBeChecked();
});
