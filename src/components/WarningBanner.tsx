import { useEffect, useRef, useState } from "react";

interface Props {
  message: string;
  dismissLabel: string;
}

/**
 * The "this page was AI-translated" banner shown on every non-English
 * locale (Layout.astro only renders this island there). Auto-hides after
 * 10s, or sooner via the close button, Escape, or a click anywhere outside
 * it (#143) — the explicit button is what makes it keyboard- and
 * screen-reader-operable; the document click listener is the "click away"
 * shortcut on top of that, not a replacement for it.
 */
export default function WarningBanner({ message, dismissLabel }: Props) {
  const [visible, setVisible] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 10_000);
    return () => window.clearTimeout(timer);
  }, []);

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
      className="flex items-center justify-between gap-4 border-b border-hairline bg-panel px-4 py-2 text-sm text-body sm:px-6"
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
