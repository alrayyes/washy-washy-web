<script lang="ts">
import type { TranslationParams, Ui } from "../i18n/ui";

interface Props {
  id: string;
  text: string;
  t: (key: keyof Ui, params?: TranslationParams) => string;
}

/**
 * A tap-to-open "?" next to a field label — `title` alone is a hover-only
 * tooltip, which a phone (this site's main device) can't reach. Closes on
 * blur so it doesn't linger once the visitor's moved on. Always a sibling
 * of the field's own `<label>`, never nested inside it — a `<button>`
 * inside a `<label>` is invalid HTML and unreliable with assistive tech.
 *
 * A real component, not a snippet, ported from SheetViewer.tsx (#243):
 * `SheetViewer.svelte`'s filter fieldset instantiates this once per
 * filter field (programme, temperature, spin, detergent), and each
 * instance needs its own independent `open` state — a snippet
 * has no state of its own, so every call site would share one copy of it
 * instead of each getting its own (same reasoning that made `CardActions`
 * a real component in the previous stage, not a snippet inside `Sheet`).
 *
 * The tooltip spans its field (`inset-x-0` against the field's `relative`
 * wrapper in SheetViewer) instead of floating at a fixed width beside the
 * button: with a 44px tap target the button can sit anywhere along the
 * label, and no fixed-width box fits on a 320px screen from every position.
 */
let { id, text, t }: Props = $props();

let open = $state(false);

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open = false;
}
</script>

<span class="normal-case">
  <button
    type="button"
    class="group -my-2 inline-flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    aria-label={t("common.whatDoesThisDo")}
    aria-expanded={open}
    aria-controls={id}
    aria-describedby={open ? id : undefined}
    onclick={() => (open = !open)}
    onblur={() => (open = false)}
    onkeydown={handleKeydown}
  >
    <!-- The 44x44 button is the tap target (#288); the small disc inside is
    only what you see, so the hit area grows without the label row doing so. -->
    <span
      class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-line text-xs font-bold text-body group-hover:bg-accent group-hover:text-white"
      aria-hidden="true">?</span
    >
  </button>
  {#if open}
    <span
      {id}
      role="tooltip"
      class="absolute inset-x-0 top-full z-10 mt-1 rounded-md border border-line bg-surface p-2 text-xs font-normal text-body shadow-md"
    >
      {text}
    </span>
  {/if}
</span>
