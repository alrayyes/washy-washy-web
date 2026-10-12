// A card's Details body is the bulk of the page's DOM (#348), so it renders
// only once that card's <details> has been opened, and stays rendered after
// that. happy-dom is registered per test, same as test/sheet-actions.test.ts.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

declare global {
  // biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
  var document: any;
}

import { afterEach, beforeEach, describe, expect, setDefaultTimeout, test } from "bun:test";
import { cardGroups, resolve } from "@washy-washy/core";
import { mount, tick, unmount } from "svelte";
import { render as svelteRender } from "svelte/server";
import SheetServer from "../src/components/Sheet.svelte";
import Sheet from "../src/components/Sheet.svelte?client";
import { translator } from "../src/i18n/ui";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

setDefaultTimeout(60_000);

const t = translator("en");
const { machine, chart: instructions } = await loadConfig(DIST_CONFIG);
const items = resolve(instructions);
const twoCards = cardGroups(items).slice(0, 2).flat();
const DETAILS_LABEL = t("common.detergent").toUpperCase();

describe("closed card details (server render)", () => {
  test("keep the summary but not the body", () => {
    const html = svelteRender(SheetServer, {
      props: { items: twoCards, machine, variant: "full", t },
    }).body;
    expect(html).toContain('data-testid="card-details"');
    expect(html).toContain(t("sheet.details"));
    expect(html).not.toContain(DETAILS_LABEL);
  });
});

// biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
let container: any;
// biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
let app: any;

beforeEach(async () => {
  GlobalRegistrator.register();
  container = document.createElement("div");
  document.body.appendChild(container);
  app = mount(Sheet, {
    target: container,
    props: { items: twoCards, machine, variant: "full", t },
  });
  await tick();
});

afterEach(async () => {
  try {
    await unmount(app);
    container.remove();
    await GlobalRegistrator.unregister();
  } finally {
    // biome-ignore lint/suspicious/noExplicitAny: see test/sheet-actions.test.ts
    delete (globalThis as any).localStorage;
  }
});

/** Opens or closes a card's <details> the way a browser does: set `open`, then fire `toggle`. */
async function setOpen(index: number, open: boolean) {
  const details = container.querySelectorAll('[data-testid="card-details"]')[index];
  details.open = open;
  details.dispatchEvent(new Event("toggle"));
  await tick();
}

const bodies = () => container.querySelectorAll('[data-testid="card-details"]');
const hasBody = (index: number) => bodies()[index].textContent.includes(DETAILS_LABEL);

describe("card details (mounted)", () => {
  test("start without a body", () => {
    expect(bodies()).toHaveLength(2);
    expect(hasBody(0)).toBe(false);
    expect(hasBody(1)).toBe(false);
  });

  test("opening one card renders only that card's body", async () => {
    await setOpen(0, true);
    expect(hasBody(0)).toBe(true);
    expect(hasBody(1)).toBe(false);
  });

  test("a body stays rendered after its card is closed again", async () => {
    await setOpen(0, true);
    await setOpen(0, false);
    expect(hasBody(0)).toBe(true);
  });
});
