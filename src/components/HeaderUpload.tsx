import { useRef, useState } from "react";
import type { Locale } from "../i18n/locales";
import { translator } from "../i18n/ui";
import { uploadConfigFile } from "../lib/customConfig";

interface Props {
  locale: Locale;
}

/**
 * A global "Upload config" control, visible in the header on every page —
 * not just `/config`'s own page-local upload. Global, app-wide actions sit
 * in the header, same spot on every page; page-local ones (like the config
 * page's own detailed upload/download section) stay near the content they
 * affect (#80).
 *
 * A page reload after a successful upload is deliberate, not a shortcut:
 * this control lives outside every page's own React island, and the app
 * already has no live cross-page sync — a page has to (re)load to pick up
 * a config change made anywhere else, the same as saving on one page has
 * always required a reload to show on another.
 */
export default function HeaderUpload({ locale }: Props) {
  const t = translator(locale);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadConfigFile(file)
      .then(() => {
        window.location.reload();
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        onClick={() => inputRef.current?.click()}
      >
        {t("upload.uploadConfig")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        aria-label={t("upload.uploadConfig")}
        className="sr-only"
        data-testid="header-upload-input"
        onChange={handleChange}
      />
      {error && (
        <p
          role="alert"
          className="absolute top-full right-0 z-10 mt-1 w-56 rounded-md border border-no/30 bg-no/5 p-2 text-xs text-no-text shadow-md"
        >
          {t("common.couldNotUseFile", { error })}
        </p>
      )}
    </div>
  );
}
