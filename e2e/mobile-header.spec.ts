import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";
import { expectTapTargets, gotoHome, PHONE } from "./mobile-support";

test.use({ viewport: PHONE });

test("the phone header shows the brand, a menu button and the theme toggle, nothing else", async ({
  page,
}) => {
  await gotoHome(page);
  const header = page.locator("header").first();

  await expect(header.getByRole("link", { name: /washy washy/i })).toBeVisible();
  await expect(header.getByRole("button", { name: "Site menu" })).toBeVisible();
  await expect(header.getByTestId("theme-toggle")).toBeVisible();
  await expect(header.getByRole("link", { name: "Docs" })).toBeHidden();
  await expect(header.locator("button", { hasText: "Upload config" })).toBeHidden();
  await expect(header.getByTestId("language-switcher")).toBeHidden();
  // The ribbon would sit on top of the menu button at this width.
  await expect(page.locator(".gh-ribbon")).toBeHidden();
});

test("the menu button opens the nav, language, upload and GitHub link, and closes again", async ({
  page,
}) => {
  await gotoHome(page);
  const header = page.locator("header").first();
  const menu = header.getByRole("button", { name: "Site menu" });

  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  for (const name of ["Home", "Washing loads", "Washer & iron", "Docs", "GitHub"]) {
    await expect(header.getByRole("link", { name })).toBeVisible();
  }
  await expect(header.locator("button", { hasText: "Upload config" })).toBeVisible();
  await expect(header.getByTestId("language-switcher")).toBeVisible();
  await expectNoA11yViolations(page);

  await menu.click();
  await expect(header.getByRole("link", { name: "Docs" })).toBeHidden();
});

test("every header control is at least 44x44, menu closed and open", async ({ page }) => {
  await gotoHome(page);
  const header = page.locator("header").first();

  await expectTapTargets(header);
  await header.getByRole("button", { name: "Site menu" }).click();
  await expectTapTargets(header);
});
