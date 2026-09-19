<script module lang="ts">
// w-48 in px, plus a little slack for the box's own border/shadow — the
// threshold this file's toggle handler checks available space against
// before deciding whether the tooltip needs to open from the right
// edge instead of the left (#59).
const TOOLTIP_WIDTH = 208;
</script>

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
 * Advanced field (cut, pile, programme, temperature, spin, detergent), and each
 * instance needs its own independent `open`/`alignRight` state — a snippet
 * has no state of its own, so every call site would share one copy of it
 * instead of each getting its own (same reasoning that made `CardActions`
 * a real component in the previous stage, not a snippet inside `Sheet`).
 */
let { id, text, t }: Props = $props();

let open = $state(false);
let alignRight = $state(false);

// Reads the button's own position off the click event's `currentTarget`
// rather than keeping a `bind:this` ref around for it — nothing else
// here ever needs the element outside this one handler.
function toggleOpen(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
  const next = !open;
  if (next) {
    const { left } = event.currentTarget.getBoundingClientRect();
    alignRight = window.innerWidth - left < TOOLTIP_WIDTH;
  }
  open = next;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open = false;
}
</script>

<span class="relative inline-block normal-case">
  <button
    type="button"
    class="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-line text-xs font-bold text-body hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    aria-label={t("common.whatDoesThisDo")}
    aria-expanded={open}
    aria-controls={id}
    aria-describedby={open ? id : undefined}
    onclick={toggleOpen}
    onblur={() => (open = false)}
    onkeydown={handleKeydown}
  >
    ?
  </button>
  {#if open}
    <span
      {id}
      role="tooltip"
      class={`absolute top-full z-10 mt-1 w-48 max-w-[80vw] rounded-md border border-line bg-surface p-2 text-xs font-normal text-body shadow-md ${alignRight ? "right-0" : "left-0"}`}
    >
      {text}
    </span>
  {/if}
</span>
