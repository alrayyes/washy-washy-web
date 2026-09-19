<script lang="ts">
import type { ResolvedInstruction } from "@washy-washy/core/browser";
import type { TranslationParams, Ui } from "../i18n/ui";

interface Props {
  group: ResolvedInstruction[];
  onDownload: (group: ResolvedInstruction[]) => Promise<string[]>;
  onShare: (group: ResolvedInstruction[]) => Promise<void>;
  t: (key: keyof Ui, params?: TranslationParams) => string;
}

/**
 * Download and share for a single card — the pile(s) it draws, not the
 * whole sheet. The actual work (rendering a PDF, touching `window`/
 * `navigator`) lives in `SheetViewer` and arrives as callbacks (#243,
 * ported from Sheet.tsx's own `CardActions`).
 *
 * A separate component, not a snippet inside `Sheet.svelte`: its own
 * instance state below (`downloading`/`error`/`dropped`/`copied`/
 * `shareStatus`/`shareError`) has to be independent per card — a snippet
 * has no state of its own, so every card would share one copy of it
 * instead of each getting its own.
 */
let { group, onDownload, onShare, t }: Props = $props();

let downloading = $state(false);
let error = $state<string | null>(null);
let dropped = $state<string[]>([]);
let copied = $state(false);
let shareStatus = $state("");
let shareError = $state<string | null>(null);

const CARD_ACTION =
  "rounded border border-line bg-surface px-1.5 py-0.5 text-xs font-semibold text-body hover:border-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60";

async function handleDownload() {
  downloading = true;
  error = null;
  dropped = [];
  try {
    dropped = await onDownload(group);
  } catch (reason) {
    error = reason instanceof Error ? reason.message : String(reason);
  } finally {
    downloading = false;
  }
}

async function handleShare() {
  shareError = null;
  try {
    await onShare(group);
    copied = true;
    // The button's own label swap ("Copy link" -> "Copied!") is the
    // visible feedback — whether assistive tech announces a label
    // change on the focused control is implementation-defined, so
    // this sr-only region carries the actual announcement (#55).
    shareStatus = t("common.copied");
    setTimeout(() => {
      copied = false;
      shareStatus = "";
    }, 2000);
  } catch (reason) {
    shareError = reason instanceof Error ? reason.message : String(reason);
  }
}
</script>

<div class="flex flex-col items-end gap-1">
  <div class="flex shrink-0 gap-1.5">
    <button type="button" class={CARD_ACTION} onclick={handleShare}>
      {copied ? t("common.copied") : t("sheet.copyLink")}
    </button>
    <button type="button" class={CARD_ACTION} onclick={handleDownload} disabled={downloading}>
      {downloading ? t("sheet.preparing") : t("sheet.download")}
    </button>
  </div>
  <p aria-live="polite" role="status" class="sr-only">
    {shareStatus}
  </p>
  {#if shareError}
    <p class="text-right text-xs text-no-text" role="alert">
      {t("sheet.couldNotCopyLink", { error: shareError })}
    </p>
  {/if}
  {#if error}
    <p class="text-right text-xs text-no-text" role="alert">
      {t("sheet.couldNotGeneratePdf", { error })}
    </p>
  {/if}
  {#if dropped.length > 0}
    <p class="text-right text-xs text-muted" role="status">
      {t("sheet.couldntRenderInPdf", { chars: dropped.join(" ") })}
    </p>
  {/if}
</div>
