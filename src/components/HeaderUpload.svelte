<!--
  A global "Upload config" control, visible in the header on every page —
  not just `/config`'s own page-local upload. Global, app-wide actions sit
  in the header, same spot on every page; page-local ones (like the config
  page's own detailed upload/download section) stay near the content they
  affect (#80).

  A page reload after a successful upload is deliberate, not a shortcut:
  this control lives outside every page's own island, and the app already
  has no live cross-page sync — a page has to (re)load to pick up a config
  change made anywhere else, the same as saving on one page has always
  required a reload to show on another.
-->
<script lang="ts">
import type { Locale } from "../i18n/locales";
import { translator } from "../i18n/ui";
import { uploadConfigFile } from "../lib/customConfig";

interface Props {
  locale: Locale;
}

const { locale }: Props = $props();
const t = $derived(translator(locale));

let inputEl: HTMLInputElement | undefined = $state();
let error = $state<string | null>(null);

function handleChange(event: Event) {
  const target = event.currentTarget as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (!file) return;

  uploadConfigFile(file)
    .then(() => {
      window.location.reload();
    })
    .catch((reason) => {
      error = reason instanceof Error ? reason.message : String(reason);
    });
}
</script>

<div class="relative">
  <button
    type="button"
    class="inline-flex min-h-9 items-center justify-center rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    onclick={() => inputEl?.click()}
  >
    {t("upload.uploadConfig")}
  </button>
  <input
    bind:this={inputEl}
    type="file"
    accept="application/json,.json"
    aria-label={t("upload.uploadConfig")}
    class="sr-only"
    data-testid="header-upload-input"
    onchange={handleChange}
  />
  {#if error}
    <p
      role="alert"
      class="absolute top-full right-0 z-10 mt-1 w-56 rounded-md border border-no/30 bg-no/5 p-2 text-xs text-no-text shadow-md"
    >
      {t("common.couldNotUseFile", { error })}
    </p>
  {/if}
</div>
