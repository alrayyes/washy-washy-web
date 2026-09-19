// Sheet.svelte's CardActions is the one piece of the sheet that isn't pure
// render logic: its download/share buttons drive real async state
// (downloading/error/copied/dropped-chars) that only changes in response to
// a real click, so `svelte/server`'s `render()` (test/sheet-render.test.ts's
// and test/sheet-fields.test.ts's own tool) can only ever see its initial,
// idle render. happy-dom's `GlobalRegistrator`, registered per test below
// and nowhere else, gives this one file a real `window`/`document` so
// Svelte's own `mount`/`unmount` (imported from the plain `"svelte"`
// package, via a `?client`-suffixed import — see
// test/support/svelteCompile.ts's own doc comment for why) can mount, click
// and re-render it for real — see stryker.config.mjs's own comment on why
// this file, specifically, earns that over the DOM-free approach everything
// else exercising Sheet.svelte uses.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

/**
 * This program's own tsconfig (tsconfig.test.json) deliberately carries no
 * "DOM" lib — every other test file in it is plain `bun:test` logic, and
 * pulling the DOM lib in for everyone just for this file's own happy-dom
 * usage was rejected (see stryker.config.mjs). `document` itself is
 * therefore not a name TypeScript knows here; this declares just enough of
 * it — untyped, on purpose — for the calls below to resolve at all. It
 * mirrors test/support/windowShim.d.ts's own reasoning for urlHistory.ts,
 * scaled to "no types" rather than "a hand-written minimal type", since
 * this file's job is exercising real interactive markup, not one or two
 * property reads.
 */
declare global {
  // biome-ignore lint/suspicious/noExplicitAny: see the comment above
  var document: any;
}

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cardGroups, type ResolvedInstruction, resolve } from "@washy-washy/core";
import { mount, tick, unmount } from "svelte";
import Sheet from "../src/components/Sheet.svelte?client";
import { translator } from "../src/i18n/ui";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

const t = translator("en");
const { machine, chart: instructions } = await loadConfig(DIST_CONFIG);
const items = resolve(instructions);
// A single card's worth of items — exactly one "Copy link"/"Download" pair
// on the page, so button lookups below don't need to disambiguate.
const oneCard = cardGroups(items)[0] as typeof items;

/** A promise this test controls the resolution/rejection of by hand. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// biome-ignore lint/suspicious/noExplicitAny: see the `document` shim above
let container: any;
// biome-ignore lint/suspicious/noExplicitAny: see the `document` shim above
let app: any;

async function mountSheet(
  onDownloadCard: ((group: ResolvedInstruction[]) => Promise<string[]>) | undefined,
  onShareCard: ((group: ResolvedInstruction[]) => Promise<void>) | undefined,
) {
  container = document.createElement("div");
  document.body.appendChild(container);
  app = mount(Sheet, {
    target: container,
    props: {
      items: oneCard,
      machine,
      variant: "full",
      t,
      onDownloadCard,
      onShareCard,
    },
  });
  await tick();
}

function copyButton() {
  return [...container.querySelectorAll("button")].find(
    // biome-ignore lint/suspicious/noExplicitAny: see the `document` shim above
    (button: any) =>
      button.textContent === t("sheet.copyLink") || button.textContent === t("common.copied"),
  );
}

function downloadButton() {
  return [...container.querySelectorAll("button")].find(
    // biome-ignore lint/suspicious/noExplicitAny: see the `document` shim above
    (button: any) =>
      button.textContent === t("sheet.download") || button.textContent === t("sheet.preparing"),
  );
}

// bun:test loads every file into one process and runs `describe` bodies
// (registering their tests) regardless of which ones actually execute — a
// mutation run scoped to some other file's covering tests would still load
// this one. An `afterAll` here would only fire if one of THIS file's own
// tests ran, so registering/unregistering globally at module scope or in
// `afterAll` risks leaving happy-dom's globals (a getter-only
// `localStorage`, replacing Bun's own writable one — see
// test/storage.test.ts's own comment) behind for whatever file loads next
// in that same process. `beforeEach`/`afterEach` scope the swap to exactly
// the span of one test, however this file's own tests are selected to run.
//
// That still isn't quite enough under `bun --inspect` specifically (the
// mode Stryker's own bun runner always uses for per-test coverage,
// `stryker.config.mjs`'s own header comment) — confirmed live, isolated
// down to a minimal repro: mounting *any* Svelte component (this file's
// own `Sheet`, or even a bare `SectionHeading`) while happy-dom is
// registered causes a getter-only `localStorage` accessor to appear as an
// *own* property of `globalThis` itself (not just on `window`), and
// `GlobalRegistrator.unregister()` doesn't remove it — it's happy-dom
// patching the real, shared `globalThis` rather than a scoped `window` it
// fully owns. `Object.getOwnPropertyDescriptor` confirms it's left
// `configurable: true` even so, meaning it can be deleted outright (a
// plain reassignment, tried first, still throws — it has no setter). Left
// alone, this survives long past `unregister()` and breaks every later
// file in the same process that assigns to `globalThis.localStorage`
// (`test/storage.test.ts`, `test/theme-preference.test.ts`) the moment a
// coverage-instrumented run puts them in the same process as this file —
// confirmed by reproducing the exact "Attempted to assign to readonly
// property" failure with `bun --conditions=browser --inspect test test/`
// and clearing it here. Plain `bun test` (no `--inspect`) never triggers
// the accessor in the first place, which is why this never showed up
// before Stryker's own coverage collection needed it.
beforeEach(() => {
  GlobalRegistrator.register();
});

afterEach(async () => {
  try {
    await unmount(app);
    container.remove();
    await GlobalRegistrator.unregister();
  } finally {
    // Runs even if the steps above threw (e.g. a mismatched Svelte
    // build resolving `mount`/`unmount` to the server target when
    // `--conditions=browser` is missing) — the stray accessor this
    // clears is a side effect of `mount` having run at all, and would
    // otherwise survive to break a later, unrelated test file's own
    // `globalThis.localStorage` assignment for the rest of the process.
    // biome-ignore lint/suspicious/noExplicitAny: see the `document` shim above
    delete (globalThis as any).localStorage;
  }
});

describe("CardActions", () => {
  test("starts idle: no dropped-chars, error, or share-status message before any click", async () => {
    await mountSheet(
      () => Promise.resolve([]),
      () => Promise.resolve(),
    );

    // The {chars}/{error} placeholders aside, this static wording only
    // ever appears once dropped.length/error/shareError go truthy.
    expect(container.textContent).not.toContain("Couldn't render in the PDF");
    expect(container.querySelector('[role="status"]').textContent).toBe("");
    expect(container.querySelector('[role="alert"]')).toBeFalsy();
    // Both buttons share the same real, non-empty styling class.
    const cardActionClass = copyButton().className;
    expect(cardActionClass).not.toBe("");
    expect(downloadButton().className).toBe(cardActionClass);
  });

  test("starting a new download immediately clears a previous one's dropped-chars message", async () => {
    let attempt = 0;
    const pending = deferred<string[]>();
    await mountSheet(
      () => {
        attempt += 1;
        return attempt === 1 ? Promise.resolve(["★"]) : pending.promise;
      },
      () => Promise.resolve(),
    );

    downloadButton().click();
    await tick();
    expect(container.textContent).toContain(t("sheet.couldntRenderInPdf", { chars: "★" }));

    downloadButton().click();
    await tick();
    // The second download hasn't resolved yet, but the first one's leftover
    // message must already be gone, not just eventually overwritten by
    // some other value — no couldntRenderInPdf message at all right now.
    expect(container.textContent).not.toContain("Couldn't render in the PDF");
  });

  test("copying the link swaps the label to Copied!, then reverts after the delay", async () => {
    await mountSheet(
      () => Promise.resolve([]),
      () => Promise.resolve(),
    );

    expect(copyButton().textContent).toBe(t("sheet.copyLink"));

    copyButton().click();
    await tick();
    expect(copyButton().textContent).toBe(t("common.copied"));
    expect(container.querySelector('[role="status"]').textContent).toBe(t("common.copied"));

    await new Promise((r) => setTimeout(r, 2100));
    await tick();
    expect(copyButton().textContent).toBe(t("sheet.copyLink"));
    expect(container.querySelector('[role="status"]').textContent).toBe("");
  });

  test("a failed share shows the couldNotCopyLink message with the reason", async () => {
    await mountSheet(
      () => Promise.resolve([]),
      () => Promise.reject(new Error("clipboard blocked")),
    );

    copyButton().click();
    await tick();

    expect(container.textContent).toContain(
      t("sheet.couldNotCopyLink", { error: "clipboard blocked" }),
    );
    // A failed share never claims success.
    expect(copyButton().textContent).toBe(t("sheet.copyLink"));
  });

  test("a non-Error share rejection is stringified, not swallowed", async () => {
    await mountSheet(
      () => Promise.resolve([]),
      () => Promise.reject("offline"),
    );

    copyButton().click();
    await tick();

    expect(container.textContent).toContain(t("sheet.couldNotCopyLink", { error: "offline" }));
  });

  test("downloading shows Preparing… and disables the button until the promise settles", async () => {
    const pending = deferred<string[]>();
    await mountSheet(
      () => pending.promise,
      () => Promise.resolve(),
    );

    expect(downloadButton().disabled).toBeFalsy();

    downloadButton().click();
    await tick();
    expect(downloadButton().textContent).toBe(t("sheet.preparing"));
    expect(downloadButton().disabled).toBeTruthy();

    pending.resolve([]);
    await pending.promise;
    await tick();
    expect(downloadButton().textContent).toBe(t("sheet.download"));
    expect(downloadButton().disabled).toBeFalsy();
  });

  test("reports characters the PDF renderer had to drop", async () => {
    await mountSheet(
      () => Promise.resolve(["★", "♥"]),
      () => Promise.resolve(),
    );

    downloadButton().click();
    await tick();

    expect(container.textContent).toContain(t("sheet.couldntRenderInPdf", { chars: "★ ♥" }));
  });

  test("a successful download after a previous failure clears the old error", async () => {
    let attempt = 0;
    await mountSheet(
      () => {
        attempt += 1;
        return attempt === 1 ? Promise.reject(new Error("first try failed")) : Promise.resolve([]);
      },
      () => Promise.resolve(),
    );

    downloadButton().click();
    await tick();
    expect(container.textContent).toContain(
      t("sheet.couldNotGeneratePdf", { error: "first try failed" }),
    );

    downloadButton().click();
    await tick();
    expect(container.textContent).not.toContain("first try failed");
  });

  test("a non-Error download rejection is stringified, not swallowed", async () => {
    await mountSheet(
      () => Promise.reject("disk full"),
      () => Promise.resolve(),
    );

    downloadButton().click();
    await tick();

    expect(container.textContent).toContain(t("sheet.couldNotGeneratePdf", { error: "disk full" }));
  });

  test("no actions row at all when the card has no download/share callbacks", async () => {
    await mountSheet(undefined, undefined);

    expect(copyButton()).toBeUndefined();
    expect(downloadButton()).toBeUndefined();
  });

  test("no actions row when only onDownloadCard is provided", async () => {
    await mountSheet(() => Promise.resolve([]), undefined);
    expect(copyButton()).toBeUndefined();
    expect(downloadButton()).toBeUndefined();
  });

  test("no actions row when only onShareCard is provided", async () => {
    await mountSheet(undefined, () => Promise.resolve());
    expect(copyButton()).toBeUndefined();
    expect(downloadButton()).toBeUndefined();
  });
});
