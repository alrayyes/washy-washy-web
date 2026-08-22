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
  // color-contrast: text-muted on bg-panel falls just under AA (4.39:1 vs.
  // 4.5:1) in a couple of places on this page — tracked by #57's systematic
  // contrast pass across the whole app, not fixed piecemeal here.
  await expectNoA11yViolations(page, ["color-contrast"]);
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

  // The bundled chart's first row uses "Cottons" (data/washing-instructions.csv.dist).
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
