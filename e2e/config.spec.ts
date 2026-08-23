import { expect, type Page, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

/**
 * See `sheet.spec.ts` for why every navigation waits on `data-hydrated`
 * before interacting — the same island-hydration race applies here.
 */
async function goto(page: Page) {
  await page.goto("/config");
  await page.waitForSelector('[data-hydrated="true"]');
}

/** The config page's own download link — the current active config, as `{ machine, chart }`. */
async function downloadedConfig(page: Page) {
  const href = await page.locator('a[download="washy-washy.json"]').getAttribute("href");
  return JSON.parse(
    decodeURIComponent(href?.replace("data:application/json;charset=utf-8,", "") ?? ""),
  );
}

test("shows a read-only machine summary, with a link to edit it", async ({ page }) => {
  await goto(page);

  await expect(page.getByText(/Generic front loader/)).toBeVisible();
  await expect(page.getByText(/Generic steam iron/)).toBeVisible();
  // A raw dump would read as one giant blob of braces and quotes; a
  // structured page has program names as their own visible list items.
  await expect(page.locator("pre")).toHaveCount(0);

  const editLink = page.getByRole("link", { name: /Edit machine/ });
  await expect(editLink).toHaveAttribute("href", "/config/machine");
  await expectNoA11yViolations(page);
});

test("shows every pile in the bundled chart", async ({ page }) => {
  await goto(page);

  const rows = page.locator('[data-testid="chart-cards"] > article');
  await expect(rows).not.toHaveCount(0);
});

test("each chart card exposes an h3 heading that tracks the pile name", async ({ page }) => {
  await goto(page);

  const firstCard = page.locator('[data-testid="chart-cards"] > article').first();
  const heading = firstCard.getByRole("heading", { level: 3 });

  await expect(heading).toHaveAccessibleName("White");

  await firstCard.locator('input[name="clothing_type"]').fill("Renamed Pile");
  await expect(heading).toHaveAccessibleName("Renamed Pile");
});

test("a cited row's card shows the source as a link, read-only", async ({ page }) => {
  await goto(page);

  const config = await downloadedConfig(page);
  expect(config.chart[0].reference_name).toBe("");
  config.chart[0].reference_name = "Which?";
  config.chart[0].reference_link = "https://example.com/wash-guide";

  await page.setInputFiles('[data-testid="page-upload-input"]', {
    name: "washy-washy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(config, null, 2)),
  });
  await expect(page.getByText("Showing your own config.")).toBeVisible();

  const firstCard = page.locator('[data-testid="chart-cards"] > article').first();
  const link = firstCard.getByRole("link", { name: "Which?" });
  await expect(link).toHaveAttribute("href", "https://example.com/wash-guide");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");

  // Every other card, still uncited, shows nothing new.
  await expect(page.locator('[data-testid="chart-cards"] > article').nth(1)).not.toContainText(
    "SOURCE",
  );
});

function pileNames(page: Page) {
  return page
    .locator('[data-testid="chart-cards"] input[name="clothing_type"]')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
}

test("the default is chart order, not sorted", async ({ page }) => {
  await goto(page);

  // The bundled chart's own order ("White", "White Socks", "White Towels",
  // "Coloured", ...) is not alphabetical, so this fails the moment the
  // default silently applies a sort.
  const names = await pileNames(page);
  expect(names).not.toEqual([...names].sort((a, b) => a.localeCompare(b)));
});

test("sorting by pile reorders the cards, and an in-progress edit survives it", async ({
  page,
}) => {
  await goto(page);

  const firstCard = page.locator('[data-testid="chart-cards"] > article').first();
  await firstCard.locator('input[name="clothing_type"]').fill("Zzz Edited Pile");

  await page
    .getByRole("radiogroup", { name: "Sort by" })
    .getByRole("radio", { name: "Pile" })
    .click();

  const names = await pileNames(page);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  // Sorting reorders the cards, it doesn't reset them — the edit above is
  // still there, now wherever "Zzz Edited Pile" alphabetizes to.
  expect(names).toContain("Zzz Edited Pile");
});

test("sort-by is a real radiogroup: arrow keys move selection via native radio behaviour", async ({
  page,
}) => {
  await goto(page);

  const group = page.getByRole("radiogroup", { name: "Sort by" });
  const chartOrder = group.getByRole("radio", { name: "Chart order" });
  const pile = group.getByRole("radio", { name: "Pile" });

  await expect(chartOrder).toBeChecked();
  await expect(pile).not.toBeChecked();

  // Real <input type="radio"> elements sharing a name: the browser handles
  // roving tabindex and arrow-key movement natively — nothing here is this
  // app's own code to re-verify, just that wiring onChange to setSortField
  // actually reorders the chart when the browser moves the selection.
  await chartOrder.focus();
  await page.keyboard.press("ArrowRight");

  await expect(pile).toBeChecked();
  await expect(chartOrder).not.toBeChecked();

  const names = await pileNames(page);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));

  await page.keyboard.press("ArrowLeft");
  await expect(chartOrder).toBeChecked();
});

test("the nav reaches all three pages, each marking only itself active", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');
  const nav = page.getByRole("navigation", { name: "Site" });

  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Washing loads" })).not.toHaveAttribute(
    "aria-current",
  );
  await expect(nav.getByRole("link", { name: "Machine" })).not.toHaveAttribute("aria-current");

  await nav.getByRole("link", { name: "Washing loads" }).click();
  await expect(page).toHaveURL(/\/config\/?$/);
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(nav.getByRole("link", { name: "Washing loads" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  await expect(nav.getByRole("link", { name: "Machine" })).not.toHaveAttribute("aria-current");

  await nav.getByRole("link", { name: "Machine" }).click();
  await expect(page).toHaveURL(/\/config\/machine\/?$/);
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(nav.getByRole("link", { name: "Machine" })).toHaveAttribute("aria-current", "page");
  // Nested under /config, but Machine has its own link now — Washing
  // loads shouldn't also claim to be the current page.
  await expect(nav.getByRole("link", { name: "Washing loads" })).not.toHaveAttribute(
    "aria-current",
  );

  await nav.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("the footer's legal links reach real pages with the site's own chrome", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');

  await page.getByRole("link", { name: "Disclaimer" }).click();
  await expect(page).toHaveURL(/\/disclaimer\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Disclaimer" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Site" })).toBeVisible();
  // Scoped to <main> — the footer's own small print repeats this exact
  // phrase on every page, including this one.
  await expect(page.locator("main").getByText(/not a manufacturer's guarantee/)).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: "Privacy policy" }).click();
  await expect(page).toHaveURL(/\/privacy\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Privacy policy" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Site" })).toBeVisible();
  await expect(page.locator("main").getByText(/no cookies, no analytics/)).toBeVisible();
});

test("a skip-to-content link is the first tab stop on every page, and lands focus on main", async ({
  page,
}) => {
  for (const path of ["/", "/config", "/config/machine"]) {
    await page.goto(path);
    await page.waitForSelector('[data-hydrated="true"]');

    // Visually hidden until it holds focus — this is the check for that,
    // not just that it exists in the DOM. `sr-only`'s `clip: rect(0,0,0,0)`
    // still gives Playwright's toBeVisible() a non-empty 1x1px box (the
    // same reason the chip radios needed opacity instead of sr-only, #49),
    // so the bounding box's size is the real signal here, not toBeVisible.
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    const hiddenBox = await skipLink.boundingBox();
    expect(hiddenBox?.width).toBeLessThanOrEqual(1);

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    const visibleBox = await skipLink.boundingBox();
    expect(visibleBox?.width).toBeGreaterThan(1);

    await skipLink.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  }
});

test("the nav doesn't force horizontal scroll at a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');

  // Scoped to the site chrome's own <header> — Sheet.tsx has an unrelated
  // <header> of its own further down the page.
  const header = page.locator("body > header");
  await expect.poll(() => header.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test("editing a chart field and saving applies it across the site", async ({ page }) => {
  await goto(page);

  const detergentInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .locator('textarea[name="detergent"]');
  await detergentInput.fill("E2E Custom Detergent Note");
  await page.getByRole("button", { name: /Save changes/ }).click();

  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await expect(detergentInput).toHaveValue("E2E Custom Detergent Note");

  // The same edit shows up on the main page — both read the same
  // localStorage-backed config (customConfig.ts).
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(page.getByText("E2E Custom Detergent Note")).toBeVisible();
});

test("an invalid edit names the row and column, and isn't applied", async ({ page }) => {
  await goto(page);

  // Every constrained field (temperature, programme, …) is a chip or a
  // select now — the UI can't produce an invalid value for those at all.
  // Emptying the one genuinely free-text required field is the remaining
  // way to reach instructionsFromRows's validation from this page.
  const pileInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .locator('input[name="clothing_type"]');
  await pileInput.fill("");
  await page.getByRole("button", { name: /Save changes/ }).click();

  await expect(page.getByRole("alert")).toContainText(/row \d+, column "clothing_type"/);
  await expect(page.getByRole("alert")).toContainText("must not be empty");
  // The bad edit never took: still the bundled config, not a half-applied one.
  await expect(page.getByText("Showing the bundled example config.")).toBeVisible();
});

test("an invalid duration is flagged inline and blocks save", async ({ page }) => {
  await goto(page);

  const durationInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .getByRole("textbox", { name: "Duration" });
  await durationInput.fill("abc");

  await expect(durationInput).toHaveAttribute("aria-invalid", "true");
  const hintId = await durationInput.getAttribute("aria-describedby");
  await expect(page.locator(`#${hintId}`)).toBeVisible();
  await expect(page.locator(`#${hintId}`)).toContainText(/H:MM/);

  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByRole("alert")).toContainText(/row \d+, column "duration"/);
  await expect(page.getByRole("alert")).toContainText(/H:MM/);
  // The bad edit never took: still the bundled config, not a half-applied one.
  await expect(page.getByText("Showing the bundled example config.")).toBeVisible();
});

test("a valid duration round-trips through save and reload, ~ prefix included", async ({
  page,
}) => {
  await goto(page);

  const durationInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .getByRole("textbox", { name: "Duration" });
  await durationInput.fill("2:30");
  await expect(durationInput).toHaveAttribute("aria-invalid", "false");
  await page.getByRole("button", { name: /Save changes/ }).click();

  await expect(page.getByText("Showing your own config.")).toBeVisible();
  const chart = (await downloadedConfig(page)).chart;
  expect(chart[0].duration).toBe("~2:30");

  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');
  await expect(
    page.locator('[data-testid="chart-cards"] > article').first().getByRole("textbox", {
      name: "Duration",
    }),
  ).toHaveValue("2:30");
});

test("chips and pills all apply and download correctly", async ({ page }) => {
  await goto(page);

  // Every constrained field is a click, styled the same as the read-only
  // sheet's chip rows (Sheet.tsx's ChipRow) — see the screenshot in #90.
  const card = page.locator('[data-testid="chart-cards"] > article').first();
  await card.locator('[data-testid="chip-temperature-30"]').click();
  await card.locator('[data-testid="toggle-fabric_softener"]').click();
  await card.locator('[data-testid="chip-options-Speed"]').click();
  await card.locator('[data-testid="chip-colour_group-dark"]').click();
  await card.locator('[data-testid="chip-mix_tags-solo"]').click();
  await page.getByRole("button", { name: /Save changes/ }).click();

  await expect(page.getByText("Showing your own config.")).toBeVisible();

  const config = await downloadedConfig(page);
  const row = config.chart[0];
  expect(row.temperature).toBe("30");
  expect(row.fabric_softener).toBe("yes");
  expect(row.options.split("|")).toContain("Speed");
  expect(row.colour_group).toBe("dark");
  expect(row.mix_tags.split("|")).toContain("solo");
});

test("toggling ironing off hides the iron setting chips and clears the value", async ({ page }) => {
  await goto(page);

  // The first pile in the bundled chart is ironed — see data/washing-
  // instructions.csv.dist — so its iron-setting chips start visible.
  const card = page.locator('[data-testid="chart-cards"] > article').first();
  await expect(card.locator('[data-testid="chip-iron_setting-3"]')).toBeVisible();

  await card.locator('[data-testid="toggle-ironing"]').click();

  await expect(card.locator('[data-testid="chip-iron_setting-3"]')).toHaveCount(0);
  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByText("Showing your own config.")).toBeVisible();

  const config = await downloadedConfig(page);
  expect(config.chart[0].ironing).toBe("no");
  expect(config.chart[0].iron_setting).toBe("");
});

test("an edit survives a reload", async ({ page }) => {
  await goto(page);

  const notesInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .locator('textarea[name="notes"]');
  await notesInput.fill("Persisted E2E note");
  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByText("Showing your own config.")).toBeVisible();

  await page.reload();
  await page.waitForSelector('[data-hydrated="true"]');

  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await expect(
    page.locator('[data-testid="chart-cards"] > article').first().locator('textarea[name="notes"]'),
  ).toHaveValue("Persisted E2E note");
});

test("downloading the config from the config page reflects an edit", async ({ page }) => {
  await goto(page);

  const notesInput = page
    .locator('[data-testid="chart-cards"] > article')
    .first()
    .locator('textarea[name="notes"]');
  await notesInput.fill("Download E2E note");
  await page.getByRole("button", { name: /Save changes/ }).click();
  await expect(page.getByText("Showing your own config.")).toBeVisible();

  const config = await downloadedConfig(page);
  expect(config.chart[0].notes).toBe("Download E2E note");
});

test("uploading a config, downloading it back out, and clearing it round-trip", async ({
  page,
}) => {
  await goto(page);

  // Download the active (bundled) config, edit one pile's name, and
  // re-upload it — the same round trip a household member editing their
  // config externally would do.
  const config = await downloadedConfig(page);
  config.chart[0].clothing_type = "E2E Custom Pile";

  await page.setInputFiles('[data-testid="page-upload-input"]', {
    name: "washy-washy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(config, null, 2)),
  });

  await expect(page.getByText("Showing your own config.")).toBeVisible();
  await expect(
    page
      .locator('[data-testid="chart-cards"] > article')
      .first()
      .locator('input[name="clothing_type"]'),
  ).toHaveValue("E2E Custom Pile");

  // Upload something invalid: the error shows, and the just-uploaded
  // config stays active rather than silently reverting.
  await page.setInputFiles('[data-testid="page-upload-input"]', {
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{not valid json"),
  });
  await expect(page.getByRole("alert")).toContainText("Could not use that file");
  await expect(page.getByText("Showing your own config.")).toBeVisible();

  await page.getByRole("button", { name: /Use the bundled example instead/ }).click();
  await expect(page.getByText("Showing the bundled example config.")).toBeVisible();
});

test("an uploaded config with a value the machine doesn't have names the row and column", async ({
  page,
}) => {
  await goto(page);

  // Valid JSON, but a temperature the bundled machine can't be set to — the
  // kind of typo a household member editing the config by hand would make.
  // #72: this should name exactly what's wrong, not just "invalid chart".
  const config = await downloadedConfig(page);
  config.chart[0].temperature = "99";

  await page.setInputFiles('[data-testid="page-upload-input"]', {
    name: "washy-washy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(config, null, 2)),
  });

  await expect(page.getByRole("alert")).toContainText(/row \d+, column "temperature"/);
  await expect(page.getByRole("alert")).toContainText("99");
  // The bad upload never took: still the bundled config, not a half-applied one.
  await expect(page.getByText("Showing the bundled example config.")).toBeVisible();
});
