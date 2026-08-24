import { useEffect, useRef } from "react";
import { useKeyboardNav } from "../hooks/useKeyboardNav";
import type { Locale } from "../i18n/locales";
import { translator } from "../i18n/ui";
import { KEY_BINDINGS } from "../lib/keyboardNav";

interface Props {
  locale: Locale;
}

/**
 * Global, header-mounted (`SiteHeader.astro`) — same placement rule as
 * `ThemeToggle`/`HeaderUpload`: a site-wide control lives in the header,
 * not repeated per page. Renders both the `?`-shortcut's own visible
 * trigger (so a mouse or screen-reader user reaches the same overlay a
 * keyboard-only visitor gets to via the shortcut) and the overlay itself.
 *
 * A native `<dialog>`, not a hand-rolled modal: `showModal()` gives a real
 * focus trap, an Escape handler and top-layer stacking for free, all of
 * which `rules/a11y.md`'s "fully operable, focus trapped" requirement
 * would otherwise mean reimplementing by hand (#133).
 */
export default function KeyboardNav({ locale }: Props) {
  const t = translator(locale);
  const { helpOpen, openHelp, closeHelp } = useKeyboardNav();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (helpOpen && !dialog.open) dialog.showModal();
    if (!helpOpen && dialog.open) dialog.close();

    // Fires for every close, Escape included — this is what keeps
    // `helpOpen` in sync when the dialog closes itself rather than being
    // told to by `closeHelp` (a plain `open` attribute wouldn't get this
    // for free; `showModal()`'s dialog does).
    function handleClose() {
      closeHelp();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [helpOpen, closeHelp]);

  return (
    <>
      <button
        type="button"
        data-testid="keyboard-help-trigger"
        aria-label={t("keyboardNav.title")}
        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-line bg-surface p-1.5 text-sm font-bold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        onClick={openHelp}
      >
        <span aria-hidden="true">?</span>
      </button>
      {/* The dialog element's own box is the backdrop's click target too
      (there's no way to attach a listener to ::backdrop directly) — a
      click lands here with `target === dialogRef.current` only when it's
      outside the content wrapper below, which is what "click outside
      closes it" means for a native dialog. Escape already closes it
      natively, so this onClick is a mouse-only supplement, not the only
      way to close it — no keyboard equivalent needed. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: see above */}
      <dialog
        ref={dialogRef}
        data-testid="keyboard-help-dialog"
        aria-label={t("keyboardNav.title")}
        className="max-w-sm rounded-lg border border-hairline bg-panel p-6 text-body shadow-lg backdrop:bg-ink/40"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeHelp();
        }}
      >
        {/* Purely to stop the backdrop-click handler above from also firing
        for a click inside the dialog's own content — not itself an
        interactive element, so it needs no keyboard equivalent. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: see above */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: see above */}
        <div onClick={(event) => event.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-bold text-ink">{t("keyboardNav.title")}</h2>
            <button
              type="button"
              className="text-sm font-semibold text-body hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={closeHelp}
            >
              {t("keyboardNav.close")}
            </button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 text-sm">
            {KEY_BINDINGS.map((binding) => (
              <div className="contents" key={binding.keys}>
                <dt>
                  <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs">
                    {binding.keys}
                  </kbd>
                </dt>
                <dd>{t(binding.descriptionKey)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </dialog>
    </>
  );
}
