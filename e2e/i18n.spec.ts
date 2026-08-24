import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

/**
 * Home, disclaimer and privacy all mount SheetViewer-free chrome except the
 * home page itself, which carries SheetViewer's `data-hydrated` flag — see
 * dev-docs/hydration.md. The banner's dismiss button is a real React
 * handler (WarningBanner is `client:load`), so tests that click it go
 * through the home page and wait on that flag the same way sheet.spec.ts
 * does; the language switcher itself is a plain <select> with an inline
 * `onchange`, so it works before hydration and doesn't need the wait.
 */
async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await page.waitForSelector('[data-hydrated="true"]');
}

test("the language switcher lists every locale, in its own name, and switches the current page", async ({
  page,
}) => {
  await page.goto("/");

  const select = page.getByLabel("Language");
  await expect(select.locator("option")).toHaveText([
    "English",
    "日本語",
    "Deutsch",
    "Español",
    "Français",
    "Jive",
  ]);

  await select.selectOption({ label: "日本語" });
  await expect(page).toHaveURL(/\/ja\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("あなたの洗濯チャート");
});

test("switching language from a page with no translation falls back to that locale's home", async ({
  page,
}) => {
  await page.goto("/config");

  await page.getByLabel("Language").selectOption({ label: "Français" });
  await expect(page).toHaveURL(/\/fr\/?$/);
});

test("English site chrome doesn't bleed into a translated page, or the other way round", async ({
  page,
}) => {
  await gotoHydrated(page, "/ja/");
  await expect(page.getByRole("navigation", { name: "Site" }).getByRole("link")).toHaveText([
    "ホーム",
    "洗濯物",
    "洗濯機とアイロン",
    "ドキュメント",
  ]);

  // "Washing loads" only exists in English (#144) — following it should land
  // back on the plain English page, chrome included, not a half-translated one.
  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "洗濯物" })
    .click();
  await expect(page).toHaveURL(/\/config\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("navigation", { name: "Site" }).getByRole("link")).toHaveText([
    "Home",
    "Washing loads",
    "Washer & iron",
    "Docs",
  ]);
});

test("the AI-translation banner only shows on non-English locales, and hreflang alternates cover all six", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("language-warning-banner")).toHaveCount(0);

  await page.goto("/de/");
  await expect(page.getByTestId("language-warning-banner")).toBeVisible();
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(7); // all 6 locales, plus x-default
});

test("the banner auto-dismisses after 10 seconds", async ({ page }) => {
  await page.clock.install();
  await gotoHydrated(page, "/ja/");

  const banner = page.getByTestId("language-warning-banner");
  await expect(banner).toBeVisible();

  await page.clock.fastForward(10_000);
  await expect(banner).toHaveCount(0);
});

test("the banner can be dismissed early, via its close button or a click elsewhere on the page", async ({
  page,
}) => {
  await gotoHydrated(page, "/ja/");
  const banner = page.getByTestId("language-warning-banner");

  await banner.getByRole("button", { name: "閉じる" }).click();
  await expect(banner).toHaveCount(0);

  await gotoHydrated(page, "/ja/");
  await expect(banner).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(banner).toHaveCount(0);
});

test("a translated page with the banner visible passes an accessibility scan", async ({ page }) => {
  await gotoHydrated(page, "/ja/");
  await expect(page.getByTestId("language-warning-banner")).toBeVisible();

  await expectNoA11yViolations(page);
});
