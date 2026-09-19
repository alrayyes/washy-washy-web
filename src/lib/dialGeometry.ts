/**
 * The point-on-a-circle and SVG-arc-path math shared by `ProgramDial.svelte`
 * and `IronDial.svelte`. Ported unchanged from `dials.tsx`'s own private
 * `polar`/`arc` helpers (#243) — pure functions, no reactive state, so a
 * plain module rather than a `.svelte.ts` file with runes.
 */
export function polar(cx: number, cy: number, radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

/** SVG arc path between two angles, measured clockwise from 12 o'clock. */
export function arc(cx: number, cy: number, radius: number, from: number, to: number): string {
  const start = polar(cx, cy, radius, from);
  const end = polar(cx, cy, radius, to);
  // `>` vs `>=` only differs when `to - from` is exactly 180, and neither of
  // this file's two call sites can ever produce that: ProgramDial's ring
  // passes `360 - 1.2 * (360 / washer.programs.length)`, which only equals
  // 180 for a fractional (impossible) program count; IronDial's fixed 280
  // degree sweep means any two positions in the same "lap" span at most 140
  // degrees before the modulo wrap in `angleOf` kicks in, and a pair
  // straddling that wrap can't land on a clean +180 either (confirmed by
  // working the arithmetic through both branches). Confirmed equivalent by
  // inspection, same as the `Stryker disable` lines already in url.ts/
  // locales.ts for this exact reason.
  // Stryker disable next-line EqualityOperator
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
