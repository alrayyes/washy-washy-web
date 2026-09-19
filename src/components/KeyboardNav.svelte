<!--
  Global, header-mounted (`SiteHeader.astro`) — same placement rule as
  `ThemeToggle`/`HeaderUpload`: a site-wide control lives in the header,
  not repeated per page. Renders both the `?`-shortcut's own visible
  trigger (so a mouse or screen-reader user reaches the same overlay a
  keyboard-only visitor gets to via the shortcut) and the overlay itself.

  A native `<dialog>`, not a hand-rolled modal: `showModal()` gives a real
  focus trap, an Escape handler and top-layer stacking for free, all of
  which `rules/a11y.md`'s "fully operable, focus trapped" requirement
  would otherwise mean reimplementing by hand (#133).
-->
<script lang="ts">
import { attachKeyboardNav, closeHelp, isHelpOpen, openHelp } from "../hooks/useKeyboardNav.svelte";
import type { Locale } from "../i18n/locales";
import { translator } from "../i18n/ui";
import { KEY_BINDINGS } from "../lib/keyboardNav";

interface Props {
  locale: Locale;
}

const { locale }: Props = $props();
const t = $derived(translator(locale));

let dialog: HTMLDialogElement | undefined = $state();

// Mounts the module's single `window` keydown listener and tears it down
// again on unmount — the Svelte-5 equivalent of the original hook's
// `useEffect(() => { ...; return () => ...; }, [])`.
$effect(() => {
  return attachKeyboardNav();
});

$effect(() => {
  const open = isHelpOpen();
  if (!dialog) return;

  if (open && !dialog.open) dialog.showModal();
  if (!open && dialog.open) dialog.close();

  // Fires for every close, Escape included — this is what keeps
  // `helpOpen` in sync when the dialog closes itself rather than being
  // told to by `closeHelp` (a plain `open` attribute wouldn't get this
  // for free; `showModal()`'s dialog does).
  function handleClose() {
    closeHelp();
  }
  dialog.addEventListener("close", handleClose);
  return () => dialog?.removeEventListener("close", handleClose);
});
</script>

<button
  type="button"
  data-testid="keyboard-help-trigger"
  aria-label={t("keyboardNav.title")}
  class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-line bg-surface p-1.5 text-sm font-bold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
  onclick={openHelp}
>
  <span aria-hidden="true">?</span>
</button>
<!-- The dialog element's own box is the backdrop's click target too
(there's no way to attach a listener to ::backdrop directly) — a
click lands here with `event.target === dialog` only when it's
outside the content wrapper below, which is what "click outside
closes it" means for a native dialog. Escape already closes it
natively, so this onclick is a mouse-only supplement, not the only
way to close it — no keyboard equivalent needed. -->
<!-- biome-ignore lint/a11y/useKeyWithClickEvents: see above -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
  bind:this={dialog}
  data-testid="keyboard-help-dialog"
  aria-label={t("keyboardNav.title")}
  class="max-w-sm rounded-lg border border-hairline bg-panel p-6 text-body shadow-lg backdrop:bg-ink/40"
  onclick={(event) => {
    if (event.target === dialog) closeHelp();
  }}
>
  <!-- Purely to stop the backdrop-click handler above from also firing
  for a click inside the dialog's own content — not itself an
  interactive element, so it needs no keyboard equivalent. -->
  <!-- biome-ignore lint/a11y/noStaticElementInteractions: see above -->
  <!-- biome-ignore lint/a11y/useKeyWithClickEvents: see above -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div onclick={(event) => event.stopPropagation()}>
    <div class="mb-3 flex items-center justify-between gap-4">
      <h2 class="font-heading text-lg font-bold text-ink">{t("keyboardNav.title")}</h2>
      <button
        type="button"
        class="text-sm font-semibold text-body hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onclick={closeHelp}
      >
        {t("keyboardNav.close")}
      </button>
    </div>
    <dl class="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 text-sm">
      {#each KEY_BINDINGS as binding (binding.keys)}
        <div class="contents">
          <dt>
            <kbd class="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs">
              {binding.keys}
            </kbd>
          </dt>
          <dd>{t(binding.descriptionKey)}</dd>
        </div>
      {/each}
    </dl>
  </div>
</dialog>
