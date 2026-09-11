// Sheet.tsx's CardActions is the one piece of that file that isn't pure
// render logic: its download/share buttons drive real async state
// (downloading/error/copied/dropped-chars) that only changes in response to
// a real click, so `renderToStaticMarkup` (test/sheet-render.test.ts's own
// tool, used for every other component in this file) can only ever see its
// initial, idle render. happy-dom's `GlobalRegistrator`, registered per test
// below and nowhere else, gives this one file a real `window`/`document` so
// `react-dom/client` can mount, click and re-render it for real — see
// stryker.config.mjs's own comment on why this file, specifically, earns
// that over the DOM-free approach everything else in Sheet.tsx uses.
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
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import Sheet from "../src/components/Sheet";
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
let root: any;

async function mount(
  onDownloadCard: ((group: ResolvedInstruction[]) => Promise<string[]>) | undefined,
  onShareCard: ((group: ResolvedInstruction[]) => Promise<void>) | undefined,
) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      createElement(Sheet, {
        items: oneCard,
        machine,
        variant: "full",
        onDownloadCard,
        onShareCard,
      }),
    );
  });
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
beforeEach(() => {
  GlobalRegistrator.register();
  // react-dom/client's `act()` warns unless this is set — see
  // https://react.dev/warnings/react-dom-test-utils.
  // biome-ignore lint/suspicious/noExplicitAny: a runtime-only flag React reads off globalThis, not a typed API
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  act(() => {
    root.unmount();
  });
  container.remove();
  await GlobalRegistrator.unregister();
});

describe("CardActions", () => {
  test("starts idle: no dropped-chars, error, or share-status message before any click", async () => {
    await mount(
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
    await mount(
      () => {
        attempt += 1;
        return attempt === 1 ? Promise.resolve(["★"]) : pending.promise;
      },
      () => Promise.resolve(),
    );

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain(t("sheet.couldntRenderInPdf", { chars: "★" }));

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });
    // The second download hasn't resolved yet, but the first one's leftover
    // message must already be gone, not just eventually overwritten by
    // some other value — no couldntRenderInPdf message at all right now.
    expect(container.textContent).not.toContain("Couldn't render in the PDF");
  });

  test("copying the link swaps the label to Copied!, then reverts after the delay", async () => {
    await mount(
      () => Promise.resolve([]),
      () => Promise.resolve(),
    );

    expect(copyButton().textContent).toBe(t("sheet.copyLink"));

    await act(async () => {
      copyButton().click();
      await Promise.resolve();
    });
    expect(copyButton().textContent).toBe(t("common.copied"));
    expect(container.querySelector('[role="status"]').textContent).toBe(t("common.copied"));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 2100));
    });
    expect(copyButton().textContent).toBe(t("sheet.copyLink"));
    expect(container.querySelector('[role="status"]').textContent).toBe("");
  });

  test("a failed share shows the couldNotCopyLink message with the reason", async () => {
    await mount(
      () => Promise.resolve([]),
      () => Promise.reject(new Error("clipboard blocked")),
    );

    await act(async () => {
      copyButton().click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain(
      t("sheet.couldNotCopyLink", { error: "clipboard blocked" }),
    );
    // A failed share never claims success.
    expect(copyButton().textContent).toBe(t("sheet.copyLink"));
  });

  test("a non-Error share rejection is stringified, not swallowed", async () => {
    await mount(
      () => Promise.resolve([]),
      () => Promise.reject("offline"),
    );

    await act(async () => {
      copyButton().click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain(t("sheet.couldNotCopyLink", { error: "offline" }));
  });

  test("downloading shows Preparing… and disables the button until the promise settles", async () => {
    const pending = deferred<string[]>();
    await mount(
      () => pending.promise,
      () => Promise.resolve(),
    );

    expect(downloadButton().disabled).toBeFalsy();

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });
    expect(downloadButton().textContent).toBe(t("sheet.preparing"));
    expect(downloadButton().disabled).toBeTruthy();

    await act(async () => {
      pending.resolve([]);
      await pending.promise;
    });
    expect(downloadButton().textContent).toBe(t("sheet.download"));
    expect(downloadButton().disabled).toBeFalsy();
  });

  test("reports characters the PDF renderer had to drop", async () => {
    await mount(
      () => Promise.resolve(["★", "♥"]),
      () => Promise.resolve(),
    );

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain(t("sheet.couldntRenderInPdf", { chars: "★ ♥" }));
  });

  test("a successful download after a previous failure clears the old error", async () => {
    let attempt = 0;
    await mount(
      () => {
        attempt += 1;
        return attempt === 1 ? Promise.reject(new Error("first try failed")) : Promise.resolve([]);
      },
      () => Promise.resolve(),
    );

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain(
      t("sheet.couldNotGeneratePdf", { error: "first try failed" }),
    );

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });
    expect(container.textContent).not.toContain("first try failed");
  });

  test("a non-Error download rejection is stringified, not swallowed", async () => {
    await mount(
      () => Promise.reject("disk full"),
      () => Promise.resolve(),
    );

    await act(async () => {
      downloadButton().click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain(t("sheet.couldNotGeneratePdf", { error: "disk full" }));
  });

  test("no actions row at all when the card has no download/share callbacks", async () => {
    await mount(undefined, undefined);

    expect(copyButton()).toBeUndefined();
    expect(downloadButton()).toBeUndefined();
  });

  test("no actions row when only onDownloadCard is provided", async () => {
    await mount(() => Promise.resolve([]), undefined);
    expect(copyButton()).toBeUndefined();
    expect(downloadButton()).toBeUndefined();
  });

  test("no actions row when only onShareCard is provided", async () => {
    await mount(undefined, () => Promise.resolve());
    expect(copyButton()).toBeUndefined();
    expect(downloadButton()).toBeUndefined();
  });
});
