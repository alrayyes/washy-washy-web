import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./locales";

const KEY = "washy-washy:locale";

/**
 * The last locale the visitor actually navigated the app in — distinct
 * from the current page's own locale (`localeFromPath` reads that off the
 * URL). Only consulted for one thing: restoring the right nav links when
 * `/docs` falls back to English chrome for a locale Starlight has no
 * content for (jive, #144) — see `DOCS_FALLBACK_RESTORE_SCRIPT` below.
 */
export function readLocalePreference(): Locale | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw !== null && isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeLocalePreference(locale: Locale): void {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    // Same fail-open reasoning as every other localStorage write here —
    // the current visit still works, it just isn't remembered.
  }
}

/**
 * `Layout.astro` inlines this on every app page (home/disclaimer/privacy/
 * config/machine), so the preference reflects the last real locale the
 * visitor was on even if they arrived there directly rather than through
 * the language switcher. Never emitted for the `/docs` fallback page
 * itself (see that page's own note) — writing there would immediately
 * overwrite the very preference the restore script is about to read.
 */
export function localePreferenceScript(locale: Locale): string {
  return `try{localStorage.setItem(${JSON.stringify(KEY)},${JSON.stringify(locale)})}catch(e){}`;
}

/**
 * `SiteHeader.astro`/`SiteFooter.astro` inline this only when the current
 * page is `/docs` resolved to the default locale (`matchDocsSlug` + `locale
 * === DEFAULT_LOCALE`) — the one page a jive visitor's own locale can't
 * exist for (Starlight rejects "jive"'s BCP-47 tag), so English chrome is
 * unavoidable there. Everywhere else this condition is false and the
 * script isn't emitted at all, so a genuine English visit is never touched.
 *
 * Rewrites every `[data-restore-locale]` link's `href` by prefixing it
 * with the stored preference, same convention as `relativeLocaleUrl` — the
 * source hrefs are always root-relative (`/`, `/config`, ...), so a plain
 * string prefix is equivalent to reapplying that function client-side.
 */
export const DOCS_FALLBACK_RESTORE_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(KEY)});
    var valid = ${JSON.stringify(LOCALES.filter((l) => l !== DEFAULT_LOCALE))};
    if (!stored || valid.indexOf(stored) === -1) return;
    var links = document.querySelectorAll("[data-restore-locale]");
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute("href", "/" + stored + links[i].getAttribute("href"));
    }
  } catch (e) {}
})();`;
