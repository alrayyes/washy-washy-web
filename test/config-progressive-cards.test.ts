// The config page's chart cards are all open on purpose (#302), so they can't
// be lazily rendered per card; instead only the first batch is in the DOM and
// a "Show more" button reveals the next (#348). happy-dom is registered per
// test, same as test/sheet-lazy-details.test.ts.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

declare global {
  // biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
  var document: any;
}

import { afterEach, beforeEach, describe, expect, setDefaultTimeout, test } from "bun:test";
import type { Instruction } from "@washy-washy/core";
import { mount, tick, unmount } from "svelte";
import ConfigViewer from "../src/components/ConfigViewer.svelte?client";
import { translator } from "../src/i18n/ui";
import { CONFIG_CARD_BATCH } from "../src/lib/configCards";
import { readCustomConfig } from "../src/lib/customConfig";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

setDefaultTimeout(60_000);

const t = translator("en");
const { machine, chart } = await loadConfig(DIST_CONFIG);
const TOTAL = chart.length;

// biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
let container: any;
// biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
let app: any;

async function open(items: Instruction[]) {
  container = document.createElement("div");
  document.body.appendChild(container);
  app = mount(ConfigViewer, { target: container, props: { items, machine, locale: "en" } });
  await tick();
}

beforeEach(() => {
  GlobalRegistrator.register();
});

afterEach(async () => {
  try {
    if (app) await unmount(app);
    container?.remove();
    app = undefined;
    await GlobalRegistrator.unregister();
  } finally {
    // biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
    delete (globalThis as any).localStorage;
  }
});

const cards = () => container.querySelectorAll('[data-testid="chart-cards"] > article');
const names = () =>
  [...cards()].map(
    (card: { querySelector: (s: string) => { value: string } }) =>
      card.querySelector('input[name="clothing_type"]')?.value,
  );
const moreButton = () => container.querySelector('[data-testid="show-more-cards"]');
const label = (shown: number) => t("config.showMore", { shown, total: TOTAL });
const byText = (text: string) =>
  [...container.querySelectorAll("button")].find(
    (b: { textContent: string }) => b.textContent.trim() === text,
  );

async function showMore() {
  moreButton().click();
  await tick();
}

describe("progressive chart cards", () => {
  test("the bundled chart is long enough to need two clicks", () => {
    expect(TOTAL).toBeGreaterThan(CONFIG_CARD_BATCH * 2);
    expect(CONFIG_CARD_BATCH).toBe(8);
  });

  test("renders only the first batch, with a button saying how many are shown", async () => {
    await open(chart);
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH);
    expect(names()).toEqual(chart.slice(0, CONFIG_CARD_BATCH).map((row) => row.clothingType));
    const button = moreButton();
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.textContent.trim()).toBe(label(CONFIG_CARD_BATCH));
  });

  test("each click reveals one more batch, the last one partial, then the button goes", async () => {
    await open(chart);
    await showMore();
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH * 2);
    expect(moreButton().textContent.trim()).toBe(label(CONFIG_CARD_BATCH * 2));
    await showMore();
    expect(cards()).toHaveLength(TOTAL);
    expect(moreButton()).toBeNull();
  });

  test("moves focus to the first revealed card so the button vanishing loses nothing", async () => {
    await open(chart);
    await showMore();
    const first = cards()[CONFIG_CARD_BATCH].querySelector('input[name="clothing_type"]');
    expect(document.activeElement).toBe(first);
    await showMore();
    const next = cards()[CONFIG_CARD_BATCH * 2].querySelector('input[name="clothing_type"]');
    expect(document.activeElement).toBe(next);
  });

  test("a chart of exactly one batch has no button", async () => {
    await open(chart.slice(0, CONFIG_CARD_BATCH));
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH);
    expect(moreButton()).toBeNull();
  });

  test("a chart one over a batch has a button that reveals the last card", async () => {
    await open(chart.slice(0, CONFIG_CARD_BATCH + 1));
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH);
    expect(moreButton()).not.toBeNull();
    await showMore();
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH + 1);
    expect(moreButton()).toBeNull();
  });

  test("sorting keeps the visible count and shows the first of the sorted order", async () => {
    await open(chart);
    await showMore();
    const sort = container.querySelector('input[name="sort-by"][value="clothing_type"]');
    sort.click();
    await tick();
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH * 2);
    const sorted = chart.map((row) => row.clothingType).sort((a, b) => a.localeCompare(b));
    expect(names()).toEqual(sorted.slice(0, CONFIG_CARD_BATCH * 2));
  });

  test("an edit made to a card lands on that row, and Save keeps every row, hidden ones too", async () => {
    await open(chart);
    const input = cards()[0].querySelector('input[name="clothing_type"]');
    input.value = "Renamed Pile";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
    byText(t("common.saveChanges")).click();
    await tick();
    const saved = readCustomConfig();
    expect(saved?.chart).toHaveLength(TOTAL);
    expect(saved?.chart[0]?.clothingType).toBe("Renamed Pile");
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  test("going back to the bundled config starts over at the first batch", async () => {
    await open(chart);
    byText(t("common.saveChanges")).click();
    await tick();
    await showMore();
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH * 2);
    byText(t("config.useBundledInstead")).click();
    await tick();
    expect(cards()).toHaveLength(CONFIG_CARD_BATCH);
    expect(moreButton().textContent.trim()).toBe(label(CONFIG_CARD_BATCH));
  });
});
