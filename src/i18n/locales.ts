/**
 * The site's supported locales. "jive" isn't a real BCP-47 language — its
 * `htmlLang` uses the private-use subtag form (`en-x-jive`, RFC 5646 §2.2.7)
 * so it's still a technically valid `lang` attribute for a joke dialect of
 * English, not a claim that it's a standardised language.
 */
export const LOCALES = ["en", "ja", "de", "es", "fr", "jive"] as const;

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
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { label: "English", htmlLang: "en" },
  ja: { label: "日本語", htmlLang: "ja" },
  de: { label: "Deutsch", htmlLang: "de" },
  es: { label: "Español", htmlLang: "es" },
  fr: { label: "Français", htmlLang: "fr" },
  jive: { label: "Jive", htmlLang: "en-x-jive" },
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
 * separate — it's Starlight's own i18n system (DOCS_LOCALES/docsHref
 * below), not this table, since Starlight doesn't support "jive"'s
 * BCP-47 tag (see astro.config.mjs) and so isn't on the same locale set.
 * Anywhere else, the language switcher falls back to a locale's home page.
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
 * Locales Starlight actually has content/chrome for (#144) — every
 * configured locale except "jive", which Starlight's own i18n rejects
 * outright (astro.config.mjs). A jive visitor's "Docs" link goes to the
 * plain English docs instead, same fallback as any other untranslated page.
 */
export const DOCS_LOCALES = LOCALES.filter((locale): locale is Exclude<Locale, "jive"> =>
  ["en", "ja", "de", "es", "fr"].includes(locale),
);

export function docsHref(locale: Locale): string {
  return (DOCS_LOCALES as readonly Locale[]).includes(locale)
    ? relativeLocaleUrl(locale, "/docs/")
    : "/docs/";
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
