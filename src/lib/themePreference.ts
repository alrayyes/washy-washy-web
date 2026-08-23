const KEY = "washy-washy:theme";

export type ThemePreference = "light" | "dark";

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark";
}

/**
 * The visitor's explicit light/dark choice, if they've ever made one.
 * `null` means "no explicit choice" — the page follows `prefers-color-scheme`
 * (`global.css`'s `light-dark()` values), not a stored default.
 *
 * Wrapped in a `try`, same reasoning as `storage.ts`'s `readFilters`:
 * private browsing can throw on `localStorage` itself, not just leave it
 * empty.
 */
export function readThemePreference(): ThemePreference | null {
  try {
    const raw = localStorage.getItem(KEY);
    return isThemePreference(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeThemePreference(theme: ThemePreference): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Private browsing, a full quota, or no storage at all — the toggle
    // still works for this visit, it just doesn't carry over to the next.
  }
}

/**
 * The bootstrap script's own source, as a string — `Layout.astro` inlines
 * this verbatim as the first thing in `<head>`, before anything paints, so
 * a stored explicit preference applies with no flash of the other mode.
 * Kept here rather than written twice (once here for the toggle to reuse
 * the same key/logic, once inline in the `.astro` file) so the two can
 * never drift apart — `Layout.astro` imports and inlines this constant,
 * it doesn't retype it.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(KEY)});
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {}
})();`;
