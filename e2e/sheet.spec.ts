import { expect, type Page, test } from "@playwright/test";

/**
 * The real user journeys `test/*.test.ts` can't reach: those exercise pure
 * logic and static markup (`renderToStaticMarkup`), never an actual
 * browser, an actual click, or actual `localStorage`. This is the outer,
 * end-to-end layer that was missing — see #67.
 */

/**
 * `SheetViewer` is a client:load island: the server-rendered HTML is on the
 * page before React attaches to it. An interaction fired in that gap still
 * "succeeds" — Playwright mutates the real DOM node — but nothing is
 * listening yet, so the change never reaches React state. Racy without this:
 * passed most of the time, since hydration is normally fast, and failed
 * outright once it wasn't.
 */
async function goto(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForSelector('[data-hydrated="true"]');
}

/**
 * Uploads a config through the config page — the only place a chart or
 * machine can be replaced now (#11) — then returns to the given index path.
 */
async function uploadConfig(page: Page, config: unknown, indexPath = "/") {
  await goto(page, "/config");
  await page.setInputFiles('input[type="file"]', {
    name: "washy-washy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(config, null, 2)),
  });
  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await goto(page, indexPath);
}

/** The config page's own download link — the current active config, as `{ machine, chart }`. */
async function downloadedConfig(page: Page) {
  await goto(page, "/config");
  const href = await page.locator('a[download="washy-washy.json"]').getAttribute("href");
  return JSON.parse(
    decodeURIComponent(href?.replace("data:application/json;charset=utf-8,", "") ?? ""),
  );
}

test("shows the bundled chart as a real page, not an embedded PDF", async ({ page }) => {
  await goto(page);

  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("article")).not.toHaveCount(0);
  await expect(page.locator("svg").first()).toBeVisible();
});

test("cut filter switches which sheet renders", async ({ page }) => {
  await goto(page);
  const cards = page.locator("article");
  const fullCount = await cards.count();

  await page.locator("fieldset select").selectOption("iron");

  // The ironing cut groups by thermostat position rather than one card per
  // pile, so the count is expected to change, not just the content.
  await expect(cards.first()).toContainText(/Thermostat on|Do not iron/i);
  expect(await cards.count()).not.toBe(fullCount);
});

test("pile search narrows the cards, and a non-match says so", async ({ page }) => {
  await goto(page);
  const cards = page.locator("article");
  const allCount = await cards.count();

  await page.fill('input[type="search"]', "sock");
  await expect(cards).not.toHaveCount(allCount);
  const filteredCount = await cards.count();
  expect(filteredCount).toBeGreaterThan(0);
  for (const heading of await page.locator("article h3").allInnerTexts()) {
    expect(heading.toLowerCase()).toContain("sock");
  }

  await page.fill('input[type="search"]', "no such pile at all");
  await expect(page.getByText(/No pile matches/)).toBeVisible();
  await expect(cards).toHaveCount(0);
});

test("a filter's help bubble announces its text without opening the field", async ({ page }) => {
  await goto(page);

  const cutSelect = page.locator("#filter-cut");
  const helpButton = page.getByRole("button", { name: "What does this do?" }).first();

  await expect(helpButton).toHaveAttribute("aria-expanded", "false");
  await helpButton.click();

  // Clicking the bubble doesn't also open/focus the field it sits beside —
  // the button is a sibling of the <label> now, not nested inside it.
  await expect(cutSelect).not.toBeFocused();
  await expect(helpButton).toHaveAttribute("aria-expanded", "true");

  const controlsId = await helpButton.getAttribute("aria-controls");
  const describedById = await helpButton.getAttribute("aria-describedby");
  expect(controlsId).toBeTruthy();
  expect(describedById).toBe(controlsId);

  const tooltip = page.locator(`#${controlsId}`);
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute("role", "tooltip");
});

test("the download button generates a PDF only when clicked, not before", async ({ page }) => {
  await goto(page);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download this sheet as a PDF/ }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("washing-instructions-phone.pdf");
  const path = await download.path();
  expect(path).not.toBeNull();
});

test("a single card's download button generates just that card's PDF", async ({ page }) => {
  await goto(page);

  const card = page.locator("article").first();
  const heading = (await card.locator("h3").innerText()).replace(/^\d+\.\s*/, "");
  // "1. White" -> "white" (the same slug the download filename is built
  // from) — not asserting the exact filename since a merged card's
  // heading can be "White + White Socks", joined differently in the name.
  const expectedStem = heading
    .split(" + ")[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const downloadPromise = page.waitForEvent("download");
  await card.getByRole("button", { name: /Download/ }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain(expectedStem as string);
  expect(download.suggestedFilename()).not.toBe("washing-instructions-phone.pdf");
  const path = await download.path();
  expect(path).not.toBeNull();
});

test('a single card\'s "Copy link" copies a URL that opens straight to it', async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await goto(page);

  const card = page.locator("article").first();
  const heading = (await card.locator("h3").innerText()).replace(/^\d+\.\s*/, "");
  const pileName = heading.split(" + ")[0] as string;

  await card.getByRole("button", { name: /Copy link/ }).click();
  await expect(card.getByRole("button", { name: /Copied!/ })).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const url = new URL(copied);
  expect(url.searchParams.get("pile")).toBe(pileName);

  await goto(page, `${url.pathname}${url.search}`);
  const headings = await page.locator("article h3").allInnerTexts();
  expect(headings.length).toBeGreaterThan(0);
  for (const h of headings) expect(h.toLowerCase()).toContain((pileName as string).toLowerCase());
});

test("an uploaded config (from the config page) shows here too", async ({ page }) => {
  const config = await downloadedConfig(page);
  config.chart[0].clothing_type = "E2E Custom Pile";

  await uploadConfig(page, config);

  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await page.fill('input[type="search"]', "E2E Custom Pile");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article h3").first()).toContainText("E2E Custom Pile");
});

test("filters and an uploaded config both survive a reload", async ({ page }) => {
  const config = await downloadedConfig(page);
  config.chart[0].clothing_type = "Persisted E2E Pile";

  await uploadConfig(page, config);
  await page.locator("fieldset select").selectOption("wash");
  await page.fill('input[type="search"]', "Persisted E2E Pile");
  await expect(page.locator("article")).toHaveCount(1);

  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');

  await expect(page.locator("fieldset select")).toHaveValue("wash");
  await expect(page.locator('input[type="search"]')).toHaveValue("Persisted E2E Pile");
  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article h3").first()).toContainText("Persisted E2E Pile");
});

test("opening a URL with filter state applies it immediately, no click needed", async ({
  page,
}) => {
  // "wash", not "iron": the iron cut groups cards by thermostat setting, not
  // by pile, so its headings wouldn't contain the pile name being asserted
  // on below — "cut filter switches which sheet renders" covers that
  // grouping behaviour separately.
  await goto(page, "/?cut=wash&pile=towels");

  await expect(page.locator("fieldset select")).toHaveValue("wash");
  await expect(page.locator('input[type="search"]')).toHaveValue("towels");
  const headings = await page.locator("article h3").allInnerTexts();
  expect(headings.length).toBeGreaterThan(0);
  for (const heading of headings) {
    expect(heading.toLowerCase()).toContain("towels");
  }
});

test("changing filters updates the URL, without spamming browser history", async ({ page }) => {
  await goto(page);

  const historyLength = await page.evaluate(() => history.length);

  await page.locator("fieldset select").selectOption("wash");
  await expect(page).toHaveURL(/[?&]cut=wash/);
  await page.fill('input[type="search"]', "sock");
  await expect(page).toHaveURL(/[?&]pile=sock/);

  // Both changes above went through replaceState, not pushState — the
  // history stack shouldn't have grown at all.
  expect(await page.evaluate(() => history.length)).toBe(historyLength);

  // Back to the defaults: the params drop out rather than sitting there as
  // ?cut=full&pile= noise.
  await page.locator("fieldset select").selectOption("full");
  await page.fill('input[type="search"]', "");
  await expect(page).toHaveURL(/^[^?]*\/?$/);
});

test("a URL's filter state wins over a previous visit's saved filters", async ({ page }) => {
  // A previous, unrelated visit: washing only, searching for "denim".
  await goto(page);
  await page.locator("fieldset select").selectOption("wash");
  await page.fill('input[type="search"]', "denim");

  // A shared link arrives with different state — it should win outright,
  // not merge with what's saved.
  await goto(page, "/?cut=iron&pile=towels");

  await expect(page.locator("fieldset select")).toHaveValue("iron");
  await expect(page.locator('input[type="search"]')).toHaveValue("towels");
});
