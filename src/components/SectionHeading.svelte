<script lang="ts">
interface Props {
  /**
   * The label text, uppercased for display. Named `text` rather than
   * `children` (the original `.tsx` version's prop name) — in Svelte 5,
   * `children` is the conventional name for a snippet prop that renders
   * arbitrary markup, and this component only ever takes a plain string
   * to uppercase, never markup, so a different name avoids implying that
   * capability.
   */
  text: string;
}

/** An uppercase section label — Sheet.svelte's read-only card and ConfigViewer.tsx's editable one share it (#243, ported from SectionHeading.tsx). */
let { text }: Props = $props();
</script>

<p class="mb-1 text-xs font-bold tracking-wide text-muted">{text.toUpperCase()}</p>
