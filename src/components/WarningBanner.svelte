<script lang="ts">
import type { Attachment } from "svelte/attachments";
import { hasSeenBanner, markBannerSeen } from "../i18n/bannerSeen";
import type { Locale } from "../i18n/locales";

interface Props {
  locale: Locale;
  message: string;
  dismissLabel: string;
}

/**
 * The "this page was AI-translated" banner shown on non-English locales
 * (Layout.astro only renders this island there). Shows once per locale per
 * browser (bannerSeen.ts) — not once per page load — so it doesn't
 * reappear every time a visitor moves between /ja/, its disclaimer and its
 * privacy page. Auto-hides after 10s on that first showing, or sooner via
 * the close button, Escape, or a click anywhere outside it (#143) — the
 * explicit button is what makes it keyboard- and screen-reader-operable;
 * the document click listener is the "click away" shortcut on top of
 * that, not a replacement for it.
 *
 * Starts closed (`visible = false`) on the server and on first client
 * render — matching, not guessing, since neither has read localStorage
 * yet — and a mount `$effect` opens it only if this locale hasn't been
 * seen. Astro islands don't warn on a server/client mismatch the way a
 * full SPA route would, so this avoids a flash without needing the theme
 * bootstrap script's inline-script trick (themePreference.ts).
 */
let { locale, message, dismissLabel }: Props = $props();

let visible = $state(false);

// Runs once on mount (locale doesn't change under a given instance) and
// its returned callback runs on unmount, same split React's effect
// cleanup made between "set up the timer" and "tear it down".
$effect(() => {
  if (hasSeenBanner(locale)) return;
  markBannerSeen(locale);
  visible = true;
  const timer = window.setTimeout(() => {
    visible = false;
  }, 10_000);
  return () => window.clearTimeout(timer);
});

// Attached to the banner element itself once it's in the DOM (i.e. only
// while `visible` is true) and torn down when it's removed — the
// Svelte-native replacement for a ref plus a pair of document listeners
// set up in an empty-deps effect.
const dismissOnOutsideActivity: Attachment<HTMLDivElement> = (element) => {
  function dismissIfOutside(event: MouseEvent) {
    if (!element.contains(event.target as Node)) visible = false;
  }
  function dismissOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape") visible = false;
  }
  document.addEventListener("click", dismissIfOutside);
  document.addEventListener("keydown", dismissOnEscape);
  return () => {
    document.removeEventListener("click", dismissIfOutside);
    document.removeEventListener("keydown", dismissOnEscape);
  };
};
</script>

{#if visible}
  <div
    {@attach dismissOnOutsideActivity}
    role="alert"
    data-testid="language-warning-banner"
    class="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-hairline bg-panel px-4 py-2 text-sm text-body sm:px-6"
  >
    <!--
      sticky + top-0 so the banner stays pinned to the viewport's top
      edge while it's up, instead of scrolling away with the rest of the
      page (#143 follow-up) — still in normal flow, so it doesn't
      overlap content the way `fixed` would, and it vacates that space
      cleanly once dismissed. z-50 is a higher stacking context than
      .gh-ribbon's (global.css, `position: absolute` at z-index 40 in
      the page's top-right corner), which otherwise sits over the
      banner's dismiss button.
    -->
    <p class="flex-1">{message}</p>
    <button
      type="button"
      aria-label={dismissLabel}
      class="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface p-1.5 text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      onclick={() => (visible = false)}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
        <path
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          d="M6 6l12 12M18 6 6 18"
        />
      </svg>
    </button>
  </div>
{/if}
