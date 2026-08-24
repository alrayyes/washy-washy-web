import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  DOCS_FALLBACK_RESTORE_SCRIPT,
  localePreferenceScript,
  readLocalePreference,
  writeLocalePreference,
} from "../src/i18n/localePreference";

/** Same stand-in `storage.test.ts`/`theme-preference.test.ts` use — `bun:test` has no real `localStorage`. */
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

describe("readLocalePreference / writeLocalePreference", () => {
  test("round-trips whatever was last written", () => {
    stub(new MemoryStorage());

    writeLocalePreference("jive");

    expect(readLocalePreference()).toBe("jive");
  });

  test("returns null when nothing has been stored yet", () => {
    stub(new MemoryStorage());

    expect(readLocalePreference()).toBeNull();
  });

  test("ignores a value that isn't a configured locale", () => {
    const storage = new MemoryStorage();
    storage.setItem("washy-washy:locale", "klingon");
    stub(storage);

    expect(readLocalePreference()).toBeNull();
  });

  test("degrades to not remembering when storage itself throws", () => {
    stub(new ThrowingStorage());

    expect(() => writeLocalePreference("ja")).not.toThrow();
    expect(readLocalePreference()).toBeNull();
  });
});

describe("localePreferenceScript", () => {
  test("writes the given locale under the same key readLocalePreference/writeLocalePreference use", () => {
    const script = localePreferenceScript("de");

    expect(script).toContain('"washy-washy:locale"');
    expect(script).toContain('"de"');
  });
});

describe("DOCS_FALLBACK_RESTORE_SCRIPT", () => {
  test("reads the same key, and never lists the default locale as something to restore into", () => {
    expect(DOCS_FALLBACK_RESTORE_SCRIPT).toContain('"washy-washy:locale"');
    expect(DOCS_FALLBACK_RESTORE_SCRIPT).not.toMatch(/\["en"[,\]]/);
  });
});
