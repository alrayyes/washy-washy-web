import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

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
 * Uploads a config through the config page's own upload input (there's also
 * a global one in the header now, #80 — this helper deliberately exercises
 * the page-local one, which still shows the more detailed error/status
 * text these tests check) — then returns to the given index path.
 */
async function uploadConfig(page: Page, config: unknown, indexPath = "/") {
  await goto(page, "/config");
  await page.setInputFiles('[data-testid="page-upload-input"]', {
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
  await expectNoA11yViolations(page);
});

test("cut filter switches which sheet renders", async ({ page }) => {
  await goto(page);
  const cards = page.locator("article");
  const fullCount = await cards.count();

  await page.locator("#filter-cut").selectOption("iron");

  // The ironing cut groups by thermostat position rather than one card per
  // pile, so the count is expected to change, not just the content.
  await expect(cards.first()).toContainText(/Thermostat on|Do not iron/i);
  expect(await cards.count()).not.toBe(fullCount);
});

test("pile search narrows the cards, and a non-match says so", async ({ page }) => {
  await goto(page);
  const cards = page.locator("article");
  const allCount = await cards.count();

  await page.fill("#filter-pile", "sock");
  await expect(cards).not.toHaveCount(allCount);
  const filteredCount = await cards.count();
  expect(filteredCount).toBeGreaterThan(0);
  for (const heading of await page.locator("article h3").allInnerTexts()) {
    expect(heading.toLowerCase()).toContain("sock");
  }

  await page.fill("#filter-pile", "no such pile at all");
  await expect(page.getByText(/No pile matches/)).toBeVisible();
  await expect(cards).toHaveCount(0);
});

test("the Advanced disclosure is closed by default and filters combine with pile search as AND", async ({
  page,
}) => {
  await goto(page);
  const cards = page.locator("article");
  const allCount = await cards.count();

  await expect(page.locator("details")).not.toHaveAttribute("open", "");

  await page.getByText("Advanced", { exact: true }).click();
  await expect(page.locator("details")).toHaveAttribute("open", "");

  // The first card's own programme — guaranteed to be one a real pile
  // uses, unlike an arbitrary <option> (index 0 of washer.programs is
  // conventionally "Off", the dial's parked position, which no pile
  // actually uses).
  const program = await cards.first().locator("p.mt-1.text-xs.font-bold.text-ink").innerText();
  await page.selectOption("#filter-program", program);
  await expect(cards).not.toHaveCount(allCount);
  const programCount = await cards.count();
  expect(programCount).toBeGreaterThan(0);

  // Combine with the pile search — AND, not OR, so the combined count is
  // never more than either filter's own count (#8).
  await page.fill("#filter-pile", "sock");
  const combinedCount = await cards.count();
  expect(combinedCount).toBeLessThanOrEqual(programCount);

  // The URL carries both, so a filtered link stays shareable.
  await expect(page).toHaveURL(new RegExp(`[?&]program=${encodeURIComponent(program as string)}`));
  await expect(page).toHaveURL(/[?&]pile=sock/);

  // A reload keeps the filter values, but the disclosure itself starts
  // closed again — that part is never remembered (#8).
  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(page.locator("details")).not.toHaveAttribute("open", "");
  await expect(page.locator("#filter-program")).toHaveValue(program as string);
  await expect(page.locator("#filter-pile")).toHaveValue("sock");
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

test("every help bubble stays inside a 320px viewport when opened", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await goto(page);

  const buttons = page.getByRole("button", { name: "What does this do?" });
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    await button.click();
    const id = await button.getAttribute("aria-controls");
    const tooltip = page.locator(`#${id}`);
    const box = await tooltip.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
    await button.click();
  }

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(320);
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
  // The visible label swap alone isn't reliably announced by assistive
  // tech on a focused control, so a dedicated live region carries the
  // actual confirmation (#55).
  await expect(card.getByRole("status")).toHaveText("Copied!");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const url = new URL(copied);
  expect(url.searchParams.get("pile")).toBe(pileName);

  await goto(page, `${url.pathname}${url.search}`);
  const headings = await page.locator("article h3").allInnerTexts();
  expect(headings.length).toBeGreaterThan(0);
  for (const h of headings) expect(h.toLowerCase()).toContain((pileName as string).toLowerCase());
});

test("a failed copy is announced as an alert, not just logged", async ({ page }) => {
  // Forced rather than relying on an unglanted clipboard-write permission
  // to reject on its own — that's environment-dependent, this isn't.
  // Exercises a path this button previously had no handling for at all
  // (#55).
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });
  await goto(page);

  const card = page.locator("article").first();
  await card.getByRole("button", { name: /Copy link/ }).click();

  await expect(card.getByRole("alert")).toContainText("Could not copy the link");
  // The button never claims success it didn't have.
  await expect(card.getByRole("button", { name: /Copy link/ })).toBeVisible();
});

test("an uploaded config (from the config page) shows here too", async ({ page }) => {
  const config = await downloadedConfig(page);
  config.chart[0].clothing_type = "E2E Custom Pile";

  await uploadConfig(page, config);

  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await page.fill("#filter-pile", "E2E Custom Pile");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article h3").first()).toContainText("E2E Custom Pile");
});

test("the header's upload control works from any page, not just /config", async ({ page }) => {
  const config = await downloadedConfig(page);
  config.chart[0].clothing_type = "Header Upload Pile";

  await goto(page, "/");
  await page.setInputFiles('[data-testid="header-upload-input"]', {
    name: "washy-washy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(config, null, 2)),
  });

  // A successful upload reloads the page — the app has no live cross-page
  // sync, so this is the same "reload to see it" behaviour every other
  // config change already has.
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(page.locator("article h3").first()).toContainText("Header Upload Pile");
});

test("the header's upload control shows an error inline, without navigating away", async ({
  page,
}) => {
  await goto(page, "/");
  await page.setInputFiles('[data-testid="header-upload-input"]', {
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{not valid json"),
  });

  await expect(page.getByRole("alert")).toContainText("Could not use that file");
  await expect(page).toHaveURL("/");
});

test("filters and an uploaded config both survive a reload", async ({ page }) => {
  const config = await downloadedConfig(page);
  config.chart[0].clothing_type = "Persisted E2E Pile";

  await uploadConfig(page, config);
  await page.locator("#filter-cut").selectOption("wash");
  await page.fill("#filter-pile", "Persisted E2E Pile");
  await expect(page.locator("article")).toHaveCount(1);

  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');

  await expect(page.locator("#filter-cut")).toHaveValue("wash");
  await expect(page.locator("#filter-pile")).toHaveValue("Persisted E2E Pile");
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

  await expect(page.locator("#filter-cut")).toHaveValue("wash");
  await expect(page.locator("#filter-pile")).toHaveValue("towels");
  const headings = await page.locator("article h3").allInnerTexts();
  expect(headings.length).toBeGreaterThan(0);
  for (const heading of headings) {
    expect(heading.toLowerCase()).toContain("towels");
  }
});

test("changing filters updates the URL, without spamming browser history", async ({ page }) => {
  await goto(page);

  const historyLength = await page.evaluate(() => history.length);

  await page.locator("#filter-cut").selectOption("wash");
  await expect(page).toHaveURL(/[?&]cut=wash/);
  await page.fill("#filter-pile", "sock");
  await expect(page).toHaveURL(/[?&]pile=sock/);

  // Both changes above went through replaceState, not pushState — the
  // history stack shouldn't have grown at all.
  expect(await page.evaluate(() => history.length)).toBe(historyLength);

  // Back to the defaults: the params drop out rather than sitting there as
  // ?cut=full&pile= noise.
  await page.locator("#filter-cut").selectOption("full");
  await page.fill("#filter-pile", "");
  await expect(page).toHaveURL(/^[^?]*\/?$/);
});

test("a URL's filter state wins over a previous visit's saved filters", async ({ page }) => {
  // A previous, unrelated visit: washing only, searching for "denim".
  await goto(page);
  await page.locator("#filter-cut").selectOption("wash");
  await page.fill("#filter-pile", "denim");

  // A shared link arrives with different state — it should win outright,
  // not merge with what's saved.
  await goto(page, "/?cut=iron&pile=towels");

  await expect(page.locator("#filter-cut")).toHaveValue("iron");
  await expect(page.locator("#filter-pile")).toHaveValue("towels");
});
