<script lang="ts">
import type { Machine } from "@washy-washy/core/browser";
import { arc, polar, segments } from "../lib/dialGeometry";
import { colour } from "../lib/theme";

interface Props {
  program: string;
  washer: Machine["washer"];
  size?: number;
}

/**
 * The programme dial, drawn to scale: one tick per position on the real
 * fascia, in the real order, with the pointer on the one you want. Ported
 * from `dials.tsx`'s own `ProgramDial` (#243) — same geometry, same
 * `colour` object, real `<svg>` either way.
 */
let { program, washer, size = 76 }: Props = $props();

let centre = $derived(size / 2);
let outer = $derived(centre - 3);
let knob = $derived(outer * 0.45);
let index = $derived(Math.max(0, washer.programs.indexOf(program)));
let step = $derived(360 / washer.programs.length);
let pointer = $derived(polar(centre, centre, knob - 1.5, index * step));
// One path for every tick but the selected one, which is longer and a
// different colour so keeps its own `<line>` (#357).
let ticks = $derived(
  washer.programs.flatMap((_, position) =>
    position === index
      ? []
      : [
          {
            from: polar(centre, centre, outer - 4.5, position * step),
            to: polar(centre, centre, outer, position * step),
          },
        ],
  ),
);
let selectedTick = $derived({
  from: polar(centre, centre, knob + 1, index * step),
  to: polar(centre, centre, outer + 1.5, index * step),
});
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
  <path
    d={arc(centre, centre, outer, step * 0.6, 360 - step * 0.6)}
    stroke={colour.accent}
    stroke-width="0.8"
    fill="none"
  />
  {#if ticks.length > 0}
    <path d={segments(ticks)} stroke={colour.faint} stroke-width="0.7" fill="none" />
  {/if}
  {#if washer.programs.length > 0}
    <line
      x1={selectedTick.from.x}
      y1={selectedTick.from.y}
      x2={selectedTick.to.x}
      y2={selectedTick.to.y}
      stroke={colour.accent}
      stroke-width="2"
    />
  {/if}
  <circle cx={centre} cy={centre} r={knob} fill={colour.knob} stroke={colour.line} stroke-width="0.8" />
  <line x1={centre} y1={centre} x2={pointer.x} y2={pointer.y} stroke={colour.accent} stroke-width="2" />
  <circle cx={centre} cy={centre} r="1.6" fill={colour.accent} />
</svg>
