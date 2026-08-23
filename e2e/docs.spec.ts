import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

test("the footer's Docs link reaches the docs site from the app's own chrome", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');

  await page.getByRole("link", { name: "Docs" }).click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Washy washy docs" })).toBeVisible();
});

test("the docs sidebar reaches every page, and the overview page passes an accessibility scan", async ({
  page,
}) => {
  await page.goto("/docs");

  const sidebar = page.getByRole("navigation", { name: "Main" });
  await expect(
    sidebar.getByRole("link", { name: "The chart and machine files", exact: true }),
  ).toHaveAttribute("href", "/docs/chart-and-machine/");
  await expect(
    sidebar.getByRole("link", { name: "Using the web app", exact: true }),
  ).toHaveAttribute("href", "/docs/web-app/");
  await expect(
    sidebar.getByRole("link", { name: "Generate a config with AI", exact: true }),
  ).toHaveAttribute("href", "/docs/ai-prompt/");

  await expectNoA11yViolations(page);
});
