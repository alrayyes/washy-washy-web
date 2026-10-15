<script lang="ts">
import type { Machine } from "@washy-washy/core/browser";
import { arc, polar, segments } from "../lib/dialGeometry";
import { colour } from "../lib/theme";

interface Props {
  setting: string;
  settings: Machine["iron"]["settings"];
  /** Draw the crossed-out ring instead of a pointer. */
  off?: boolean;
  size?: number;
}

/**
 * The iron's thermostat ring: MIN through MAX, with the shaded band marking
 * where the iron actually makes steam, and the pointer on the right
 * setting. Ported from `dials.tsx`'s own `IronDial` (#243).
 */
let { setting, settings, off = false, size = 76 }: Props = $props();

let centre = $derived(size / 2);
let outer = $derived(centre - 3);
let knob = $derived(outer * 0.42);
const sweep = 280;
const first = -sweep / 2;
let positions = $derived(settings.map((_, position) => position));
let step = $derived(sweep / Math.max(1, positions.length - 1));
let index = $derived(
  Math.max(
    0,
    settings.findIndex((entry) => entry.key === setting),
  ),
);
function angleOf(position: number): number {
  return (first + position * step + 360) % 360;
}
let pointer = $derived(polar(centre, centre, knob - 1.5, angleOf(index)));
let steamFrom = $derived(settings.findIndex((entry) => entry.steam));
// The seed only survives to the end when no setting steams at all, and
// the render below gates on `steamFrom >= 0` (from the `findIndex` above,
// which independently yields -1 in exactly that case) — so this seed's
// own value never reaches the arc it feeds. Any seed produces the same
// observable output. Confirmed equivalent by inspection.
// Stryker disable next-line UnaryOperator
let steamTo = $derived(settings.reduce((last, entry, at) => (entry.steam ? at : last), -1));
// One path for every tick but the selected one, which is longer and a
// different colour so keeps its own `<line>` (#357). Nothing is selected
// while the dial is off.
let selectedAt = $derived(off ? -1 : index);
let ticks = $derived(
  positions.flatMap((position) =>
    position === selectedAt
      ? []
      : [
          {
            from: polar(centre, centre, outer - 5, angleOf(position)),
            to: polar(centre, centre, outer, angleOf(position)),
          },
        ],
  ),
);
let selectedTick = $derived({
  from: polar(centre, centre, outer - 9, angleOf(index)),
  to: polar(centre, centre, outer + 1.5, angleOf(index)),
});
let offLine1 = $derived(polar(centre, centre, outer - 6, 225));
let offLine2 = $derived(polar(centre, centre, outer - 6, 45));
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
  <path
    d={arc(centre, centre, outer, angleOf(0), angleOf(0) + sweep)}
    stroke={off ? colour.hairline : colour.line}
    stroke-width="1"
    fill="none"
  />
  {#if !off && steamFrom >= 0}
    <path
      d={arc(centre, centre, outer, angleOf(steamFrom), angleOf(steamTo))}
      stroke={colour.steam}
      stroke-width="3"
      fill="none"
    />
  {/if}
  {#if ticks.length > 0}
    <path d={segments(ticks)} stroke={off ? colour.hairline : colour.faint} stroke-width="0.7" fill="none" />
  {/if}
  {#if !off && positions.length > 0}
    <line
      x1={selectedTick.from.x}
      y1={selectedTick.from.y}
      x2={selectedTick.to.x}
      y2={selectedTick.to.y}
      stroke={colour.accent}
      stroke-width="2"
    />
  {/if}
  <circle
    cx={centre}
    cy={centre}
    r={knob}
    fill={off ? colour.panel : colour.knob}
    stroke={colour.line}
    stroke-width="0.8"
  />
  {#if off}
    <g>
      <circle cx={centre} cy={centre} r={outer - 6} stroke={colour.no} stroke-width="1.6" fill="none" />
      <line x1={offLine1.x} y1={offLine1.y} x2={offLine2.x} y2={offLine2.y} stroke={colour.no} stroke-width="1.6" />
    </g>
  {:else}
    <g>
      <line x1={centre} y1={centre} x2={pointer.x} y2={pointer.y} stroke={colour.accent} stroke-width="2" />
      <circle cx={centre} cy={centre} r="1.6" fill={colour.accent} />
    </g>
  {/if}
</svg>
