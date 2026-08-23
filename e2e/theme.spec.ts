import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

/**
 * See `sheet.spec.ts` for why every navigation waits on `data-hydrated`
 * before interacting — the same island-hydration race applies to
 * `ThemeToggle` (#111).
 */
async function goto(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForSelector('[data-hydrated="true"]');
}

test("with no stored preference, the page follows the OS scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await goto(page);

  // No explicit choice yet, so ThemeToggle never sets the attribute —
  // global.css's light-dark() values resolve off color-scheme: light dark
  // (i.e. the OS) on their own (#111).
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
    "aria-label",
    "Switch to light mode",
  );
});

test("clicking the toggle switches modes immediately and persists across a reload", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await goto(page);

  const toggle = page.getByTestId("theme-toggle");
  await expect(toggle).toHaveAttribute("aria-label", "Switch to dark mode");

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-label", "Switch to light mode");

  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');

  // Set by the inline bootstrap script, before hydration even runs — the
  // page's own first paint, not just the toggle's eventual re-render.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
    "aria-label",
    "Switch to light mode",
  );
});

test("an explicit choice survives a later OS scheme change, no reload needed", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await goto(page);

  const toggle = page.getByTestId("theme-toggle");
  await toggle.click(); // dark (OS) -> light (explicit)
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // Move the OS scheme through an intermediate state and back to dark —
  // two genuine change events, the second landing on the OS value the
  // explicit choice above already overrode once.
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-label", "Switch to dark mode");
});

test("the toggle is a real button: keyboard-operable, its state announced", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await goto(page);

  const toggle = page.getByTestId("theme-toggle");
  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-label", "Switch to light mode");
  await expectNoA11yViolations(page);
});

test("the toggle carries the chosen theme across pages, no per-page reset", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await goto(page, "/");

  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await goto(page, "/config");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
    "aria-label",
    "Switch to light mode",
  );
});
