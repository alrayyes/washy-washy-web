import { afterEach, describe, expect, test } from "bun:test";
import type { StoredFilters } from "../src/lib/storage";
import { writeUrlFilters } from "../src/lib/urlHistory";

function defaultFilters(overrides: Partial<StoredFilters> = {}): StoredFilters {
  return {
    cut: "full",
    pileQuery: "",
    program: "",
    temperature: "",
    spin: "",
    detergentQuery: "",
    ...overrides,
  };
}

interface ReplaceStateCall {
  data: unknown;
  unused: string;
  url?: string | null;
}

/** Stands in for the real `window` `writeUrlFilters` touches — see test/support/windowShim.d.ts. */
function stubWindow(pathname: string): ReplaceStateCall[] {
  const calls: ReplaceStateCall[] = [];
  priorWindow = globalThis.window;
  globalThis.window = {
    location: { pathname },
    history: {
      replaceState(data, unused, url) {
        calls.push({ data, unused, url });
      },
    },
  };
  return calls;
}

// Restores whatever `window` was before this file's own stub, rather than
// unconditionally deleting it: bun:test loads every file into one process,
// and test/sheet-actions.test.ts registers a real happy-dom `window` for
// its own DOM-interaction tests — deleting that out from under a file that
// happens to run afterwards would be this file reaching outside its own
// test scope.
let priorWindow: typeof globalThis.window;

afterEach(() => {
  globalThis.window = priorWindow;
});

describe("writeUrlFilters", () => {
  test("writes a bare pathname, no '?' at all, when every filter is at its default", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters());

    expect(calls).toEqual([{ data: null, unused: "", url: "/config" }]);
  });

  test("writes cut only when it isn't the default 'full' cut", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ cut: "wash" }));

    expect(calls[0]?.url).toBe("/config?cut=wash");
  });

  test("a 'full' cut is never written to the query string", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ cut: "full", pileQuery: "towels" }));

    expect(calls[0]?.url).toBe("/config?pile=towels");
  });

  test("writes a non-empty pile search", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ pileQuery: "socks" }));

    expect(calls[0]?.url).toBe("/config?pile=socks");
  });

  test("writes a non-empty program filter", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ program: "Cottons" }));

    expect(calls[0]?.url).toBe("/config?program=Cottons");
  });

  test("writes a non-empty temperature filter", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ temperature: "60" }));

    expect(calls[0]?.url).toBe("/config?temperature=60");
  });

  test("writes a non-empty spin filter", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ spin: "1200" }));

    expect(calls[0]?.url).toBe("/config?spin=1200");
  });

  test("writes a non-empty detergent filter as 'detergent', not its own field name", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ detergentQuery: "powder" }));

    expect(calls[0]?.url).toBe("/config?detergent=powder");
  });

  test("writes every filter together, in cut/pile/program/temperature/spin/detergent order", () => {
    const calls = stubWindow("/config");

    writeUrlFilters({
      cut: "iron",
      pileQuery: "towels",
      program: "Cottons",
      temperature: "60",
      spin: "1200",
      detergentQuery: "powder",
    });

    expect(calls[0]?.url).toBe(
      "/config?cut=iron&pile=towels&program=Cottons&temperature=60&spin=1200&detergent=powder",
    );
  });

  test("URL-encodes a filter value that needs it", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ pileQuery: "white socks" }));

    expect(calls[0]?.url).toBe("/config?pile=white+socks");
  });

  test("preserves whatever pathname window.location currently has", () => {
    const calls = stubWindow("/config/machine");

    writeUrlFilters(defaultFilters());

    expect(calls[0]?.url).toBe("/config/machine");
  });

  test("always calls replaceState, never pushState — a filter edit isn't a new history entry", () => {
    const calls = stubWindow("/config");

    writeUrlFilters(defaultFilters({ pileQuery: "towels" }));

    expect(calls).toHaveLength(1);
    expect(calls[0]?.data).toBeNull();
    expect(calls[0]?.unused).toBe("");
  });
});
