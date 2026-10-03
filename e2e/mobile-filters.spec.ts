import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";
import { expectTapTargets, gotoHome, PHONE } from "./mobile-support";

test.use({ viewport: PHONE });

test("on load the filters are a search box, three category pills and one Filters button", async ({
  page,
}) => {
  await gotoHome(page);
  const filters = page.getByTestId("filters");

  await expect(filters.getByRole("searchbox")).toBeVisible();
  await expect(filters.getByRole("button")).toHaveText([
    "Filters",
    "Everything",
    "Washing only",
    "Ironing only",
  ]);
  await expect(filters.locator("select:visible")).toHaveCount(0);
  await expect(filters.getByRole("button", { name: "Filters" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("the Filters button reveals the programme, temperature, spin and detergent filters", async ({
  page,
}) => {
  await gotoHome(page);
  const filters = page.getByTestId("filters");
  const toggle = filters.getByRole("button", { name: "Filters" });

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  for (const id of [
    "#filter-program",
    "#filter-temperature",
    "#filter-spin",
    "#filter-detergent",
  ]) {
    await expect(filters.locator(id)).toBeVisible();
  }

  await toggle.click();
  await expect(filters.locator("#filter-program")).toBeHidden();
});

test("a category pill picks the cut, is announced as pressed, and lands in the URL", async ({
  page,
}) => {
  await gotoHome(page);
  const filters = page.getByTestId("filters");
  const everything = filters.getByRole("button", { name: "Everything" });
  const washing = filters.getByRole("button", { name: "Washing only" });

  await expect(everything).toHaveAttribute("aria-pressed", "true");
  await washing.click();
  await expect(washing).toHaveAttribute("aria-pressed", "true");
  await expect(everything).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(/[?&]cut=wash/);
});

test("every filter control is at least 44x44, panel closed and open", async ({ page }) => {
  await gotoHome(page);
  const filters = page.getByTestId("filters");

  await expectTapTargets(filters);
  await filters.getByRole("button", { name: "Filters" }).click();
  await expectTapTargets(filters);
  await expectNoA11yViolations(page);
});
