import { describe, expect, test } from "bun:test";
import { LOCALES } from "../src/i18n/locales";
import { dictionaries, translator } from "../src/i18n/ui";

describe("dictionaries", () => {
  const englishKeys = Object.keys(dictionaries.en).sort();

  for (const locale of LOCALES.filter((locale) => locale !== "en")) {
    test(`${locale} has exactly the same keys as English`, () => {
      expect(Object.keys(dictionaries[locale]).sort()).toEqual(englishKeys);
    });
  }

  for (const locale of LOCALES) {
    test(`${locale} has no empty string values`, () => {
      for (const [key, value] of Object.entries(dictionaries[locale])) {
        expect(value.length, `${locale}.${key} is empty`).toBeGreaterThan(0);
      }
    });
  }
});

describe("translator", () => {
  test("looks up a key in the requested locale", () => {
    expect(translator("fr")("nav.home")).toBe(dictionaries.fr["nav.home"]);
  });

  test("falls back to English for an unrecognised locale", () => {
    // @ts-expect-error — exercising the runtime fallback for a bad locale value.
    expect(translator("xx")("nav.home")).toBe(dictionaries.en["nav.home"]);
  });
});
