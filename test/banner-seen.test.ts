import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { hasSeenBanner, markBannerSeen } from "../src/i18n/bannerSeen";

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

describe("hasSeenBanner / markBannerSeen", () => {
  test("is false before the banner has ever been marked seen", () => {
    stub(new MemoryStorage());

    expect(hasSeenBanner("ja")).toBe(false);
  });

  test("is true after marking it seen for that locale", () => {
    stub(new MemoryStorage());

    markBannerSeen("ja");

    expect(hasSeenBanner("ja")).toBe(true);
  });

  test("is scoped per locale — marking one locale doesn't affect another", () => {
    stub(new MemoryStorage());

    markBannerSeen("ja");

    expect(hasSeenBanner("de")).toBe(false);
  });

  test("uses the documented storage key literally, prefixed per locale", () => {
    const storage = new MemoryStorage();
    storage.setItem("washy-washy:banner-seen:ja", "true");
    stub(storage);

    expect(hasSeenBanner("ja")).toBe(true);
  });

  test("treats any stored value other than the literal string 'true' as not seen", () => {
    const storage = new MemoryStorage();
    storage.setItem("washy-washy:banner-seen:ja", "false");
    stub(storage);

    expect(hasSeenBanner("ja")).toBe(false);
  });

  test("fails open — reads as 'not seen' — when storage itself throws", () => {
    stub(new ThrowingStorage());

    expect(hasSeenBanner("ja")).toBe(false);
  });

  test("degrades silently when storage throws on write", () => {
    stub(new ThrowingStorage());

    expect(() => markBannerSeen("ja")).not.toThrow();
  });
});
