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
  // /docs is Starlight's own separate i18n system (#144) — jive isn't part
  // of it (astro.config.mjs), so it's the one page that's genuinely
  // untranslated for every locale this switcher offers, including jive.
  await page.goto("/docs/");

  await page.getByLabel("Language").selectOption({ label: "Jive" });
  await expect(page).toHaveURL(/\/jive\/?$/);
});

test("the washing-loads and washer/iron editors are translated too, and stay in their own locale across nav", async ({
  page,
}) => {
  await gotoHydrated(page, "/ja/");
  await expect(page.getByRole("navigation", { name: "Site" }).getByRole("link")).toHaveText([
    "ホーム",
    "洗濯物",
    "洗濯機とアイロン",
    "ドキュメント",
  ]);

  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "洗濯物" })
    .click();
  await expect(page).toHaveURL(/\/ja\/config\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("洗濯物一覧");

  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "洗濯機とアイロン" })
    .click();
  await expect(page).toHaveURL(/\/ja\/config\/machine\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("洗濯機とアイロンの設定");
});

test("the Docs link is locale-aware for locales Starlight supports, and falls back to English for jive, which it doesn't", async ({
  page,
}) => {
  await gotoHydrated(page, "/ja/");

  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "ドキュメント" })
    .click();
  // Starlight's own i18n (#144) does support ja for docs, so this lands on
  // /ja/docs/, not plain /docs/ — the nav link itself is locale-aware.
  await expect(page).toHaveURL(/\/ja\/docs\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");

  // jive has no Starlight docs at all (astro.config.mjs) — its Docs link
  // goes to the plain English docs instead, chrome and all.
  await gotoHydrated(page, "/jive/");
  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "The Docs, Jack" })
    .click();
  await expect(page).toHaveURL(/\/docs\/?$/);
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

test("the banner stays pinned to the top of the viewport while scrolling, instead of scrolling away", async ({
  page,
}) => {
  await gotoHydrated(page, "/ja/");
  const banner = page.getByTestId("language-warning-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toHaveCSS("position", "sticky");

  await page.mouse.wheel(0, 800);
  await expect(banner).toBeInViewport();
});

test("the banner auto-dismisses after 10 seconds", async ({ page }) => {
  await page.clock.install();
  await gotoHydrated(page, "/ja/");

  const banner = page.getByTestId("language-warning-banner");
  await expect(banner).toBeVisible();

  await page.clock.fastForward(10_000);
  await expect(banner).toHaveCount(0);
});

test("the banner can be dismissed early via its close button", async ({ page }) => {
  await gotoHydrated(page, "/ja/");
  const banner = page.getByTestId("language-warning-banner");

  await banner.getByRole("button", { name: "閉じる" }).click();
  await expect(banner).toHaveCount(0);
});

test("the banner can be dismissed early via a click elsewhere on the page", async ({ page }) => {
  await gotoHydrated(page, "/ja/");
  const banner = page.getByTestId("language-warning-banner");

  await expect(banner).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(banner).toHaveCount(0);
});

test("the banner shows once per locale, not on every page load — but a different locale still gets its own", async ({
  page,
}) => {
  const banner = page.getByTestId("language-warning-banner");

  await gotoHydrated(page, "/ja/");
  await expect(banner).toBeVisible();

  // Same locale, a different translated page — already seen, stays hidden.
  // Plain goto, not gotoHydrated: /ja/disclaimer has no other island to
  // carry a data-hydrated flag, but that's fine here — the banner's SSR
  // markup already excludes it (visible starts false), so "stays absent"
  // needs no wait to assert correctly either way.
  await page.goto("/ja/disclaimer");
  await expect(banner).toHaveCount(0);
  await gotoHydrated(page, "/ja/");
  await expect(banner).toHaveCount(0);

  // A locale never seen before still gets its own first showing.
  await gotoHydrated(page, "/de/");
  await expect(banner).toBeVisible();
});

test("a translated page with the banner visible passes an accessibility scan", async ({ page }) => {
  await gotoHydrated(page, "/ja/");
  await expect(page.getByTestId("language-warning-banner")).toBeVisible();

  await expectNoA11yViolations(page);
});

test("docs content is translated too, with Starlight's own chrome translated alongside it, and cross-links stay in the same locale", async ({
  page,
}) => {
  await page.goto("/ja/docs/");

  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Washy washy ドキュメント");

  // Scoped to <main>, exact — the sidebar and the Prev/Next pagination
  // footer (both also inside <main>, #144 follow-up) carry this same
  // translated label too, the pagination one prefixed with "次へ".
  const jaLink = page
    .getByRole("main")
    .getByRole("link", { name: "チャートと洗濯機のファイル", exact: true });
  await expect(jaLink).toHaveAttribute("href", "/ja/docs/chart-and-machine/");

  // The left-hand sidebar carries the same translated label as the page
  // it links to (astro.config.mjs's sidebar `translations`, #144 follow-up).
  // Starlight's own aria-label on this nav is itself locale-translated
  // ("メイン" here), so it's targeted by its class instead.
  await expect(page.locator("nav.sidebar")).toContainText("チャートと洗濯機のファイル");

  await jaLink.click();
  await expect(page).toHaveURL(/\/ja\/docs\/chart-and-machine\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");

  // Prev/Next pagination reads the sidebar's translations too — its own
  // "Previous"/"Next" strings come from Starlight's built-in i18n data.
  await expect(page.getByRole("link", { name: /前へ/ })).toContainText("概要");
  await expect(page.getByRole("link", { name: /次へ/ })).toContainText("ウェブアプリを使う");

  await expectNoA11yViolations(page);
});

test("the bundled example chart and machine are translated too, not just the chrome around them", async ({
  page,
}) => {
  // German: the demo washer's own programme names come out translated,
  // and stay cross-referenced correctly between the machine and the chart
  // (#144 follow-up) — src/i18n/configSource.ts.
  await gotoHydrated(page, "/de/");
  await page.locator("summary", { hasText: "Erweitert" }).click();
  await expect(page.locator("#filter-program option")).toContainText(["Baumwolle"]);

  // Jive: the joke locale gets its own rewritten demo data too, consistent
  // with every other layer of this locale already being jive-ified.
  await gotoHydrated(page, "/jive/");
  await expect(page.getByRole("article").first()).toContainText("Jack");
});
