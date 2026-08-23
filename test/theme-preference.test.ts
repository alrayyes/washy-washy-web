import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  readThemePreference,
  THEME_BOOTSTRAP_SCRIPT,
  writeThemePreference,
} from "../src/lib/themePreference";

/** Same stand-in `storage.test.ts` uses — `bun:test` has no real `localStorage`. */
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

class ThrowingStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  getItem(): never {
    throw new Error("storage is not available");
  }
  setItem(): never {
    throw new Error("storage is not available");
  }
  removeItem(): never {
    throw new Error("storage is not available");
  }
}

let original: typeof localStorage | undefined;

beforeEach(() => {
  original = (globalThis as { localStorage?: typeof localStorage }).localStorage;
});

afterEach(() => {
  (globalThis as { localStorage?: typeof localStorage }).localStorage = original as never;
});

function stub(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  (globalThis as { localStorage: unknown }).localStorage = storage;
}

describe("readThemePreference / writeThemePreference", () => {
  test("round-trips whatever was last written", () => {
    stub(new MemoryStorage());

    writeThemePreference("dark");

    expect(readThemePreference()).toBe("dark");
  });

  test("returns null when nothing has been stored yet — 'follow the OS', not a default mode", () => {
    stub(new MemoryStorage());

    expect(readThemePreference()).toBeNull();
  });

  test("ignores a value that isn't a valid theme", () => {
    const storage = new MemoryStorage();
    storage.setItem("washy-washy:theme", "sepia");
    stub(storage);

    expect(readThemePreference()).toBeNull();
  });

  test("degrades to not remembering when storage itself throws", () => {
    stub(new ThrowingStorage());

    expect(() => writeThemePreference("light")).not.toThrow();
    expect(readThemePreference()).toBeNull();
  });
});

describe("THEME_BOOTSTRAP_SCRIPT", () => {
  test("reads the same key readThemePreference/writeThemePreference use", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain('"washy-washy:theme"');
  });

  test("only ever sets data-theme to a valid explicit value, never an arbitrary stored string", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain('stored === "light"');
    expect(THEME_BOOTSTRAP_SCRIPT).toContain('stored === "dark"');
  });
});
