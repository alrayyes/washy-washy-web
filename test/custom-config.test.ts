import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type Config, configToJson, parseInstructions } from "@washy-washy/core";
import { clearCustomConfig, readCustomConfig, writeCustomConfig } from "../src/lib/customConfig";
import { DIST_MACHINE, loadMachine } from "./support/loadMachine";

/** `bun:test` has no `localStorage` global — a browser API — so stand one in. */
class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

let original: typeof localStorage | undefined;

beforeEach(() => {
  original = (globalThis as { localStorage?: typeof localStorage }).localStorage;
  (globalThis as { localStorage: unknown }).localStorage = new MemoryStorage();
});

afterEach(() => {
  (globalThis as { localStorage?: typeof localStorage }).localStorage = original as never;
});

const machine = await loadMachine(DIST_MACHINE);
const csv = await Bun.file("data/washing-instructions.csv.dist").text();
const config: Config = { machine, chart: parseInstructions(csv, machine) };

describe("readCustomConfig / writeCustomConfig / clearCustomConfig", () => {
  test("round-trips what was written back to the same config", () => {
    writeCustomConfig(config);

    expect(readCustomConfig()).toEqual(config);
  });

  test("returns null when nothing has been uploaded yet", () => {
    expect(readCustomConfig()).toBeNull();
  });

  test("falls back to null for a chart that no longer fits the stored machine", () => {
    const broken = JSON.parse(configToJson(config));
    broken.chart[0].program = "Not a real programme";
    localStorage.setItem("washy-washy:config", JSON.stringify(broken));

    expect(readCustomConfig()).toBeNull();
  });

  test("falls back to null for a value that isn't valid JSON", () => {
    localStorage.setItem("washy-washy:config", "not json");

    expect(readCustomConfig()).toBeNull();
  });

  test("clear removes a previously stored config", () => {
    writeCustomConfig(config);

    clearCustomConfig();

    expect(readCustomConfig()).toBeNull();
  });
});
