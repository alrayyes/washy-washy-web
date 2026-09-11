import { describe, expect, test } from "bun:test";
import {
  absoluteLocaleUrl,
  DEFAULT_LOCALE,
  docsHref,
  isLocale,
  LOCALE_META,
  LOCALES,
  type Locale,
  localeFromPath,
  matchDocsSlug,
  matchTranslatedPage,
  NON_DEFAULT_LOCALES,
  pagePath,
  relativeLocaleUrl,
} from "../src/i18n/locales";

describe("NON_DEFAULT_LOCALES", () => {
  test("is every locale except the default", () => {
    expect(NON_DEFAULT_LOCALES).not.toContain(DEFAULT_LOCALE);
    expect(NON_DEFAULT_LOCALES.length).toBe(LOCALES.length - 1);
    expect(new Set<Locale>(NON_DEFAULT_LOCALES)).toEqual(
      new Set<Locale>(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)),
    );
  });
});

describe("LOCALE_META", () => {
  test("has the exact label, htmlLang and dir for every locale", () => {
    expect(LOCALE_META).toEqual({
      en: { label: "English", htmlLang: "en", dir: "ltr" },
      ja: { label: "日本語", htmlLang: "ja", dir: "ltr" },
      de: { label: "Deutsch", htmlLang: "de", dir: "ltr" },
      es: { label: "Español", htmlLang: "es", dir: "ltr" },
      fr: { label: "Français", htmlLang: "fr", dir: "ltr" },
      ar: { label: "العربية", htmlLang: "ar", dir: "rtl" },
      zh: { label: "简体中文", htmlLang: "zh", dir: "ltr" },
      tr: { label: "Türkçe", htmlLang: "tr", dir: "ltr" },
      ru: { label: "Русский", htmlLang: "ru", dir: "ltr" },
      jive: { label: "Jive", htmlLang: "en-x-jive", dir: "ltr" },
      linkedin: { label: "LinkedIn", htmlLang: "en-x-linkedin", dir: "ltr" },
    });
  });
});

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
    expect(localeFromPath("/linkedin/disclaimer")).toBe("linkedin");
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
    expect(relativeLocaleUrl("linkedin", "/privacy")).toBe("/linkedin/privacy");
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
  test("matches the five translated pages regardless of locale prefix", () => {
    expect(matchTranslatedPage("/")).toBe("home");
    expect(matchTranslatedPage("/ja/")).toBe("home");
    expect(matchTranslatedPage("/disclaimer")).toBe("disclaimer");
    expect(matchTranslatedPage("/de/disclaimer")).toBe("disclaimer");
    expect(matchTranslatedPage("/privacy/")).toBe("privacy");
    expect(matchTranslatedPage("/es/privacy/")).toBe("privacy");
    expect(matchTranslatedPage("/config")).toBe("config");
    expect(matchTranslatedPage("/fr/config")).toBe("config");
    expect(matchTranslatedPage("/config/machine")).toBe("machine");
    expect(matchTranslatedPage("/jive/config/machine")).toBe("machine");
    expect(matchTranslatedPage("/linkedin/config/machine")).toBe("machine");
  });

  test("returns null for pages with no per-locale route", () => {
    expect(matchTranslatedPage("/docs/")).toBeNull();
  });

  test("strips every trailing slash, not just one", () => {
    expect(matchTranslatedPage("/config//")).toBe("config");
  });
});

describe("pagePath", () => {
  test("round-trips with matchTranslatedPage", () => {
    expect(pagePath("home")).toBe("/");
    expect(pagePath("disclaimer")).toBe("/disclaimer");
    expect(pagePath("privacy")).toBe("/privacy");
    expect(pagePath("config")).toBe("/config");
    expect(pagePath("machine")).toBe("/config/machine");
  });
});

describe("docsHref", () => {
  test("goes to that locale's own docs root, Starlight-routed or not", () => {
    expect(docsHref("en")).toBe("/docs/");
    expect(docsHref("ja")).toBe("/ja/docs/");
    expect(docsHref("de")).toBe("/de/docs/");
    // jive's and linkedin's docs aren't Starlight-routed (src/pages/jive/docs/,
    // src/pages/linkedin/docs/), but land on the exact same URL shape as every
    // locale Starlight does cover.
    expect(docsHref("jive")).toBe("/jive/docs/");
    expect(docsHref("linkedin")).toBe("/linkedin/docs/");
  });
});

describe("matchDocsSlug", () => {
  test("extracts the slug after /docs, English, Starlight-locale-prefixed, or jive's/linkedin's own routes", () => {
    expect(matchDocsSlug("/docs")).toBe("/");
    expect(matchDocsSlug("/docs/")).toBe("/");
    expect(matchDocsSlug("/docs/chart-and-machine/")).toBe("/chart-and-machine/");
    expect(matchDocsSlug("/ja/docs/chart-and-machine/")).toBe("/chart-and-machine/");
    expect(matchDocsSlug("/de/docs/")).toBe("/");
    expect(matchDocsSlug("/jive/docs/")).toBe("/");
    expect(matchDocsSlug("/jive/docs/chart-and-machine/")).toBe("/chart-and-machine/");
    expect(matchDocsSlug("/linkedin/docs/")).toBe("/");
    expect(matchDocsSlug("/linkedin/docs/chart-and-machine/")).toBe("/chart-and-machine/");
  });

  test("returns null off a docs page entirely", () => {
    expect(matchDocsSlug("/")).toBeNull();
    expect(matchDocsSlug("/config")).toBeNull();
  });

  test("doesn't match 'docs' as a mere prefix of a longer, unrelated segment", () => {
    expect(matchDocsSlug("/docsomething")).toBeNull();
  });

  test("doesn't match 'docs' appearing after an unrecognised segment", () => {
    // "foo" isn't one of the recognised locale prefixes, so this must not
    // be treated as a docs page just because "/docs" appears as a suffix.
    expect(matchDocsSlug("/foo/docs")).toBeNull();
  });
});

describe("isLocale", () => {
  test("accepts every configured locale", () => {
    for (const locale of ["en", "ja", "de", "es", "fr", "jive", "linkedin"]) {
      expect(isLocale(locale)).toBe(true);
    }
  });

  test("rejects anything else", () => {
    expect(isLocale("xx")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
