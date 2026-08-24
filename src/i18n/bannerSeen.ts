import type { Locale } from "./locales";

const PREFIX = "washy-washy:banner-seen:";

/**
 * Whether the AI-translation banner has already shown once for this
 * locale, in this browser — scoped per locale (not one flag for all of
 * them) so dismissing the Japanese warning doesn't skip the German one for
 * a visitor who lands on /de/ later.
 *
 * Wrapped in `try`, same as storage.ts's own helpers: private browsing can
 * throw on `localStorage` itself rather than leaving it `undefined`. Any
 * failure here means "show it" (fail open), not "crash the page".
 */
export function hasSeenBanner(locale: Locale): boolean {
  try {
    return localStorage.getItem(PREFIX + locale) === "true";
  } catch {
    return false;
  }
}

export function markBannerSeen(locale: Locale): void {
  try {
    localStorage.setItem(PREFIX + locale, "true");
  } catch {
    // Private browsing, a full quota, or no storage at all — the banner
    // still behaves correctly for this visit, it just shows again next time.
  }
}
