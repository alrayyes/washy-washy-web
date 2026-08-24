import { useEffect, useRef, useState } from "react";
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
 * Starts closed (`visible: false`) on the server and on first client
 * render — matching, not guessing, since neither has read localStorage
 * yet — and a mount effect opens it only if this locale hasn't been seen.
 * Astro islands don't warn on a server/client mismatch the way a full SPA
 * route would, so this avoids a flash without needing the theme
 * bootstrap script's inline-script trick (themePreference.ts).
 */
export default function WarningBanner({ locale, message, dismissLabel }: Props) {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasSeenBanner(locale)) return;
    markBannerSeen(locale);
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 10_000);
    return () => window.clearTimeout(timer);
  }, [locale]);

  useEffect(() => {
    function dismissIfOutside(event: MouseEvent) {
      if (!bannerRef.current?.contains(event.target as Node)) setVisible(false);
    }
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setVisible(false);
    }
    document.addEventListener("click", dismissIfOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("click", dismissIfOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="alert"
      data-testid="language-warning-banner"
      // .gh-ribbon (global.css) is `position: absolute` pinned to the
      // page's top-right corner at z-index 40 — without a higher stacking
      // context of its own, this banner (plain flow, z-index: auto) sits
      // underneath it, right where the dismiss button lives.
      className="relative z-50 flex items-center justify-between gap-4 border-b border-hairline bg-panel px-4 py-2 text-sm text-body sm:px-6"
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        aria-label={dismissLabel}
        className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface p-1.5 text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        onClick={() => setVisible(false)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            d="M6 6l12 12M18 6 6 18"
          />
        </svg>
      </button>
    </div>
  );
}
