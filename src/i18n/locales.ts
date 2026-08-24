/**
 * The site's supported locales. "jive" isn't a real BCP-47 language — its
 * `htmlLang` uses the private-use subtag form (`en-x-jive`, RFC 5646 §2.2.7)
 * so it's still a technically valid `lang` attribute for a joke dialect of
 * English, not a claim that it's a standardised language.
 */
export const LOCALES = ["en", "ja", "de", "es", "fr", "ar", "zh", "jive"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales with a translated home/disclaimer/privacy page — everything but the default. */
export const NON_DEFAULT_LOCALES = LOCALES.filter(
  (locale): locale is Exclude<Locale, typeof DEFAULT_LOCALE> => locale !== DEFAULT_LOCALE,
);

interface LocaleMeta {
  /** The locale's own name for itself, shown in the language switcher. */
  label: string;
  htmlLang: string;
  /** `<html dir>` — only Arabic is RTL here. Defaults to "ltr" everywhere else. */
  dir: "ltr" | "rtl";
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { label: "English", htmlLang: "en", dir: "ltr" },
  ja: { label: "日本語", htmlLang: "ja", dir: "ltr" },
  de: { label: "Deutsch", htmlLang: "de", dir: "ltr" },
  es: { label: "Español", htmlLang: "es", dir: "ltr" },
  fr: { label: "Français", htmlLang: "fr", dir: "ltr" },
  ar: { label: "العربية", htmlLang: "ar", dir: "rtl" },
  zh: { label: "简体中文", htmlLang: "zh", dir: "ltr" },
  jive: { label: "Jive", htmlLang: "en-x-jive", dir: "ltr" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

const NON_DEFAULT_PREFIX = new RegExp(`^/(${NON_DEFAULT_LOCALES.join("|")})(?:/|$)`);

/** The self-contained counterpart to `Astro.currentLocale` (unavailable — see astro.config.mjs). */
export function localeFromPath(pathname: string): Locale {
  const match = pathname.match(NON_DEFAULT_PREFIX);
  return match ? (match[1] as Locale) : DEFAULT_LOCALE;
}

/**
 * The pages that exist per-locale (src/pages/[locale]/*.astro). /docs is
 * separate (DOCS_LOCALES/docsHref below) — every locale has one, but not
 * all through the same mechanism (see DOCS_LOCALES). Anywhere else, the
 * language switcher falls back to a locale's home page.
 */
export const TRANSLATED_PAGES = ["home", "disclaimer", "privacy", "config", "machine"] as const;

export type TranslatedPage = (typeof TRANSLATED_PAGES)[number];

const PAGE_PATHS: Record<TranslatedPage, string> = {
  home: "/",
  disclaimer: "/disclaimer",
  privacy: "/privacy",
  config: "/config",
  machine: "/config/machine",
};

/**
 * Every locale has real docs (#144), but not all through Starlight: it
 * can't register "jive" as a locale at all (Intl.DisplayNames throws on
 * its en-x-jive BCP-47 tag, confirmed live), so /jive/docs is a second,
 * hand-rolled route (src/pages/jive/docs/[...slug].astro,
 * src/content.config.ts's `docsJive` collection) that happens to land on
 * the exact same URL shape Starlight gives the other five. That's why
 * this alias is worth keeping even though it's just `LOCALES` today —
 * it documents "every locale has docs", not "every locale has Starlight".
 */
export const DOCS_LOCALES = LOCALES;

export function docsHref(locale: Locale): string {
  return relativeLocaleUrl(locale, "/docs/");
}

/**
 * Matches any docs URL (English, Starlight-locale-prefixed, or jive's own
 * hand-rolled route) and returns the slug after "/docs". Lets the language
 * switcher treat `/docs` the same way `matchTranslatedPage` treats the
 * app's own pages, despite it being served by two different mechanisms.
 */
export function matchDocsSlug(pathname: string): string | null {
  const match = pathname.match(/^\/(?:(?:ja|de|es|fr|ar|zh|jive)\/)?docs(\/.*)?$/);
  return match ? (match[1] ?? "/") : null;
}

/** Matches the current URL against the pages that have per-locale routes, English or not. */
export function matchTranslatedPage(pathname: string): TranslatedPage | null {
  // Strip a leading locale segment ("/ja/disclaimer" -> "/disclaimer") so English
  // and translated URLs resolve through the same table.
  const withoutLocale = pathname.replace(
    new RegExp(`^/(${NON_DEFAULT_LOCALES.join("|")})(?=/|$)`),
    "",
  );
  const normalized = withoutLocale === "" ? "/" : withoutLocale.replace(/\/+$/, "") || "/";
  const entry = Object.entries(PAGE_PATHS).find(([, path]) => path === normalized);
  return entry ? (entry[0] as TranslatedPage) : null;
}

export function pagePath(page: TranslatedPage): string {
  return PAGE_PATHS[page];
}

/**
 * Hand-rolled in place of `astro:i18n`'s `getRelativeLocaleUrl` — there's no
 * root Astro `i18n` config to back it (see astro.config.mjs). English stays
 * unprefixed at the root; every other locale gets a `/xx` prefix.
 */
export function relativeLocaleUrl(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

export function absoluteLocaleUrl(site: URL | string, locale: Locale, path: string): string {
  return new URL(relativeLocaleUrl(locale, path), site).toString();
}
