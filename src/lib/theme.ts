/**
 * The page's colours, referencing global.css's custom properties by name
 * rather than holding a second copy of the hex values — this file feeds
 * the SVG dial illustrations (and Logo.astro), which need per-tick,
 * JS-computed colours (selected vs. not, on vs. off) that a static
 * Tailwind class can't express, so it stays a plain object rather than
 * becoming Tailwind utilities itself; it just points at the same source
 * of truth instead of copying it. `var(...)` in an SVG presentation
 * attribute resolves through the cascade like any other CSS value,
 * including the dark-mode redefinitions under
 * `@media (prefers-color-scheme: dark)` (#62) — no separate dark
 * palette needed here.
 *
 * Kept in step with `packages/pdf`'s own `theme.ts` by eye, not by
 * import — that file is react-pdf style objects (a different shape,
 * and meant for the PDF renderer specifically, which stays light-only
 * regardless of the visitor's system preference), not CSS, so there is
 * nothing to share directly. Same hex values, same names.
 */
export const colour = {
  ink: "var(--color-ink)",
  body: "var(--color-body)",
  muted: "var(--color-muted)",
  faint: "var(--color-faint)",
  line: "var(--color-line)",
  hairline: "var(--color-hairline)",
  panel: "var(--color-panel)",
  /** Bosch fascia red — the dial arc and the pointer. */
  accent: "var(--color-accent)",
  accentSoft: "var(--color-accent-soft)",
  steam: "var(--color-steam)",
  steamSoft: "var(--color-steam-soft)",
  yes: "var(--color-yes)",
  no: "var(--color-no)",
  /** The dial's knob face — not a Tailwind utility, only ever used here. */
  knob: "var(--color-knob)",
} as const;
