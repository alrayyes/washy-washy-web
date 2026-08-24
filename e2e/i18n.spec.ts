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
    "العربية",
    "简体中文",
    "Türkçe",
    "Jive",
  ]);

  await select.selectOption({ label: "日本語" });
  await expect(page).toHaveURL(/\/ja\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("あなたの洗濯チャート");
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

test("the Docs link is locale-aware for every locale, Starlight-routed or not", async ({
  page,
}) => {
  await gotoHydrated(page, "/ja/");

  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "ドキュメント" })
    .click();
  // Starlight's own i18n (#144) supports ja for docs, so this lands on
  // /ja/docs/, not plain /docs/ — the nav link itself is locale-aware.
  await expect(page).toHaveURL(/\/ja\/docs\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");

  // jive's docs aren't Starlight-routed (it can't register "jive" as a
  // Starlight locale at all — Intl.DisplayNames rejects its BCP-47 tag) —
  // src/pages/jive/docs/[...slug].astro is the hand-rolled workaround, but
  // the Docs link itself still lands there with jive's own chrome, same
  // as every other locale.
  await gotoHydrated(page, "/jive/");
  await page
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "The Docs, Jack" })
    .click();
  await expect(page).toHaveURL(/\/jive\/docs\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-x-jive");
  await expect(page.getByRole("navigation", { name: "Site" }).getByRole("link")).toHaveText([
    "Home Base",
    "Wash Piles",
    "Washer & Iron, Jack",
    "The Docs, Jack",
  ]);
});

test("switching language on a translated docs page goes to the same page in that language, jive included", async ({
  page,
}) => {
  await page.goto("/ja/docs/chart-and-machine/");

  // 言語 — the ja translation of "Language" (switcher.label, src/i18n/ui.ts).
  const select = page.getByLabel("言語");
  await select.selectOption({ label: "Deutsch" });
  await expect(page).toHaveURL(/\/de\/docs\/chart-and-machine\/?$/);

  // jive's docs live at a different route (src/pages/jive/docs/) than the
  // Starlight-routed ones, but the switcher treats it the same way —
  // matchDocsSlug doesn't care which mechanism serves the URL.
  await page.getByLabel("Sprache").selectOption({ label: "Jive" });
  await expect(page).toHaveURL(/\/jive\/docs\/chart-and-machine\/?$/);
});

test("jive's own docs render the site's chrome, a sidebar, Prev/Next, and pass an accessibility scan", async ({
  page,
}) => {
  await page.goto("/jive/docs/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en-x-jive");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Big daddy-o washy washy jive");

  // exact: true — "Jive docs pagination" (the Prev/Next nav below) would
  // otherwise match too, since Playwright's name matching is substring by
  // default.
  const sidebar = page.getByRole("navigation", { name: "Jive docs", exact: true });
  const machineLink = sidebar.getByRole("link", { name: "De Chart 'n Machine Jams" });
  await expect(machineLink).toHaveAttribute("href", "/jive/docs/chart-and-machine/");
  await machineLink.click();
  await expect(page).toHaveURL(/\/jive\/docs\/chart-and-machine\/?$/);

  // Each link's accessible name is its "Back up, Jack"/"Keep on jivin'"
  // caption plus the neighbouring page's own nav label, concatenated.
  await expect(
    page.getByRole("navigation", { name: "Jive docs pagination" }).getByRole("link"),
  ).toHaveText(["Back up, JackDe Lowdown", "Keep on jivin'Rappin' the Web Jive"]);

  await expectNoA11yViolations(page);
});

test("Arabic renders right-to-left — the app's own chrome and Starlight's docs alike", async ({
  page,
}) => {
  await gotoHydrated(page, "/ar/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("جدول الغسيل الخاص بك");

  // Starlight computes `dir` per locale from its own config (astro.config.mjs
  // sets it explicitly for ar — it isn't auto-derived when locales are
  // configured directly rather than converted from a root Astro i18n config,
  // confirmed by reading Starlight's own schema).
  await page.goto("/ar/docs/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("مستندات Washy washy");

  await expectNoA11yViolations(page);
});

test("Chinese chrome and docs are translated, and the bundled demo data comes out in Chinese too", async ({
  page,
}) => {
  await gotoHydrated(page, "/zh/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("你的洗衣图表");
  await page.locator("summary", { hasText: "高级" }).click();
  await expect(page.locator("#filter-program option")).toContainText(["棉织物"]);

  await page.goto("/zh/docs/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Washy washy 文档");

  await expectNoA11yViolations(page);
});

test("the AI-translation banner only shows on non-English locales, and hreflang alternates cover every locale", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("language-warning-banner")).toHaveCount(0);

  await page.goto("/de/");
  await expect(page.getByTestId("language-warning-banner")).toBeVisible();
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(10); // all 9 locales, plus x-default
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
