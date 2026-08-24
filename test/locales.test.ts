import { describe, expect, test } from "bun:test";
import {
  absoluteLocaleUrl,
  isLocale,
  localeFromPath,
  matchTranslatedPage,
  pagePath,
  relativeLocaleUrl,
} from "../src/i18n/locales";

describe("localeFromPath", () => {
  test("defaults to English for the root and unprefixed pages", () => {
    expect(localeFromPath("/")).toBe("en");
    expect(localeFromPath("/config")).toBe("en");
    expect(localeFromPath("/docs/")).toBe("en");
  });

  test("recognises a locale-prefixed path, with or without a trailing slash", () => {
    expect(localeFromPath("/ja/")).toBe("ja");
    expect(localeFromPath("/ja")).toBe("ja");
    expect(localeFromPath("/jive/disclaimer")).toBe("jive");
  });

  test("doesn't false-match a page whose name happens to start with a locale code", () => {
    // "/design" starts with "de" but isn't the German locale.
    expect(localeFromPath("/design")).toBe("en");
  });
});

describe("relativeLocaleUrl", () => {
  test("leaves English unprefixed", () => {
    expect(relativeLocaleUrl("en", "/")).toBe("/");
    expect(relativeLocaleUrl("en", "/disclaimer")).toBe("/disclaimer");
  });

  test("prefixes every other locale", () => {
    expect(relativeLocaleUrl("ja", "/")).toBe("/ja/");
    expect(relativeLocaleUrl("ja", "/disclaimer")).toBe("/ja/disclaimer");
    expect(relativeLocaleUrl("jive", "/privacy")).toBe("/jive/privacy");
  });
});

describe("absoluteLocaleUrl", () => {
  test("resolves the relative URL against the given site", () => {
    expect(absoluteLocaleUrl("https://washy-washy.ryankes.eu", "fr", "/disclaimer")).toBe(
      "https://washy-washy.ryankes.eu/fr/disclaimer",
    );
    expect(absoluteLocaleUrl("https://washy-washy.ryankes.eu", "en", "/")).toBe(
      "https://washy-washy.ryankes.eu/",
    );
  });
});

describe("matchTranslatedPage", () => {
  test("matches the three translated pages regardless of locale prefix", () => {
    expect(matchTranslatedPage("/")).toBe("home");
    expect(matchTranslatedPage("/ja/")).toBe("home");
    expect(matchTranslatedPage("/disclaimer")).toBe("disclaimer");
    expect(matchTranslatedPage("/de/disclaimer")).toBe("disclaimer");
    expect(matchTranslatedPage("/privacy/")).toBe("privacy");
    expect(matchTranslatedPage("/es/privacy/")).toBe("privacy");
  });

  test("returns null for pages with no per-locale route", () => {
    expect(matchTranslatedPage("/config")).toBeNull();
    expect(matchTranslatedPage("/config/machine")).toBeNull();
    expect(matchTranslatedPage("/docs/")).toBeNull();
  });
});

describe("pagePath", () => {
  test("round-trips with matchTranslatedPage", () => {
    expect(pagePath("home")).toBe("/");
    expect(pagePath("disclaimer")).toBe("/disclaimer");
    expect(pagePath("privacy")).toBe("/privacy");
  });
});

describe("isLocale", () => {
  test("accepts every configured locale", () => {
    for (const locale of ["en", "ja", "de", "es", "fr", "jive"]) {
      expect(isLocale(locale)).toBe(true);
    }
  });

  test("rejects anything else", () => {
    expect(isLocale("xx")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
