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

/**
 * Same key, same explicit-choice logic as THEME_BOOTSTRAP_SCRIPT above,
 * but always resolves and sets `data-theme` — falling back to
 * `prefers-color-scheme` when nothing's stored, rather than leaving the
 * attribute untouched. Everywhere else, leaving it unset is correct:
 * `color-scheme: light dark` plus `light-dark()` in global.css already
 * follow the OS on their own. Starlight's docs pages need the explicit
 * fallback too, though — `Page.astro` hardcodes `data-theme="dark"` at
 * the server-render step (its own since-removed ThemeProvider was always
 * meant to correct that client-side before paint), and Starlight's own
 * internal styles (the sidebar, code blocks, admonitions, …) read that
 * attribute directly with no media-query fallback of their own — left
 * uncorrected, a light-OS-preference first-time visitor would see
 * Starlight's own chrome stuck in dark mode while this site's own
 * light-dark() colours correctly followed the OS (#114).
 */
export const DOCS_THEME_BOOTSTRAP_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(KEY)});
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();`;
