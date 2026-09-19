<script lang="ts">
import type { Machine } from "@washy-washy/core/browser";
import { arc, polar } from "../lib/dialGeometry";
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
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
  <path
    d={arc(centre, centre, outer, step * 0.6, 360 - step * 0.6)}
    stroke={colour.accent}
    stroke-width="0.8"
    fill="none"
  />
  <g>
    {#each washer.programs as name, position (name)}
      {@const angle = position * step}
      {@const selected = position === index}
      {@const inner = polar(centre, centre, selected ? knob + 1 : outer - 4.5, angle)}
      {@const edge = polar(centre, centre, selected ? outer + 1.5 : outer, angle)}
      <line
        x1={inner.x}
        y1={inner.y}
        x2={edge.x}
        y2={edge.y}
        stroke={selected ? colour.accent : colour.faint}
        stroke-width={selected ? 2 : 0.7}
      />
    {/each}
  </g>
  <circle cx={centre} cy={centre} r={knob} fill={colour.knob} stroke={colour.line} stroke-width="0.8" />
  <line x1={centre} y1={centre} x2={pointer.x} y2={pointer.y} stroke={colour.accent} stroke-width="2" />
  <circle cx={centre} cy={centre} r="1.6" fill={colour.accent} />
</svg>
