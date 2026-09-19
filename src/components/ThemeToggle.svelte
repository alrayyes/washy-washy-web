<!--
  A global light/dark toggle, visible in the header on every page — same
  placement rule as `HeaderUpload` (#80): a site-wide control lives in the
  header, not repeated per page.
-->
<script lang="ts">
import type { Locale } from "../i18n/locales";
import { translator } from "../i18n/ui";
import {
  readThemePreference,
  type ThemePreference,
  writeThemePreference,
} from "../lib/themePreference";

interface Props {
  locale: Locale;
}

const { locale }: Props = $props();
const t = $derived(translator(locale));

/**
 * `effective` starts `"light"` unconditionally (matching what the server
 * renders, since Astro's build has no `window`/`matchMedia`/`localStorage`
 * to read from) and is corrected in an effect once this hydrates in a real
 * browser — the icon can lag the *true* theme by a tick right after
 * hydration, but the colours themselves never do: `Layout.astro`'s inline
 * bootstrap script (`THEME_BOOTSTRAP_SCRIPT`) already set `data-theme` on
 * `<html>` before first paint, so `global.css`'s `light-dark()` values are
 * correct from the start regardless of when this component catches up
 * (#111).
 */
let effective = $state<ThemePreference>("light");
// A plain (non-reactive) variable, not just a value the effect closes
// over — the media query's own change handler needs the *current*
// answer, not the one true when the listener was attached, or a toggle
// made after mount wouldn't stop a later OS-level change from overriding
// it back.
let hasExplicit = false;

$effect(() => {
  const stored = readThemePreference();
  if (stored) {
    hasExplicit = true;
    effective = stored;
    return;
  }

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  effective = mql.matches ? "dark" : "light";

  function handleChange(event: MediaQueryListEvent) {
    if (hasExplicit) return;
    effective = event.matches ? "dark" : "light";
  }

  mql.addEventListener("change", handleChange);
  return () => mql.removeEventListener("change", handleChange);
});

function toggle() {
  const next: ThemePreference = effective === "dark" ? "light" : "dark";
  writeThemePreference(next);
  document.documentElement.dataset.theme = next;
  hasExplicit = true;
  effective = next;
}
</script>

<button
  type="button"
  data-testid="theme-toggle"
  aria-label={effective === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
  class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-line bg-surface p-1.5 text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
  onclick={toggle}
>
  {#if effective === "dark"}
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.8" />
      <path
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"
      />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5Z"
      />
    </svg>
  {/if}
</button>
