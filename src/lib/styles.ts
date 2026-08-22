/**
 * The one editable-field affordance both editors (`/config`,
 * `/config/machine`) share — always outlined, not invisible until
 * hovered. Invisible-until-hover has no touch equivalent, and phones are
 * this site's primary target (#58).
 */
export const TEXT_INPUT =
  "w-full min-w-[8rem] rounded border border-line bg-transparent px-1 py-0.5 text-body focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * An uppercase field/section label. `text-body`, not `text-muted`:
 * muted-on-panel is 4.40:1, just under WCAG AA's 4.5:1 for this text's
 * size and weight (#57).
 *
 * No `block` here, even though SheetViewer.tsx's original copy had one —
 * turning a `<span>` from inline to block genuinely changes its own box
 * (measured: 162×14px inline vs. 265×16px block, for the same text),
 * it's not the no-op it looks like at a glance. ConfigViewer.tsx's and
 * MachineEditor.tsx's `<span>` usages sit in plain block flow (inside a
 * `<label>` that is a flex *item*, not a flex *container* for its own
 * children) and would visibly grow under `block`; SheetViewer.tsx's own
 * usages want it, so it composes `block ${FIELD_LABEL}` locally instead
 * of pushing that behaviour onto the other two islands (#60).
 */
export const FIELD_LABEL = "text-xs font-semibold tracking-wide text-body uppercase";

/**
 * The main call-to-action button (Save, Download, …) on all three
 * islands. `disabled:` variants included even where nothing currently
 * disables this exact button in a given island — cheaper than a second,
 * near-identical constant, and correct the moment one does.
 */
export const BUTTON_PRIMARY =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

/** The secondary button (Download config, Reset, …) — MachineEditor.tsx and ConfigViewer.tsx only; SheetViewer.tsx has no use for it. */
export const BUTTON_SECONDARY =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

/** A failure message, always both visible and announced (`role="alert"`). */
export const ALERT = "rounded-md border border-no/30 bg-no/5 px-3 py-2 text-sm text-no-text";

/** A grey info-box section (machine summary, upload controls, …). */
export const CARD = "rounded-lg border border-hairline bg-panel p-4";

/** A page-level <h2> ("Your config", "Machine", "Washer", "Iron", …) — the heading font, one step down from the page's own <h1> (#42). */
export const SECTION_HEADING = "mb-2 font-heading text-xl font-bold text-ink";

/**
 * A single pile's card — used identically by Sheet.tsx's read-only sheet
 * and ConfigViewer.tsx's editable chart, which is why they have to look
 * exactly alike: same data, same shape, edit vs. display is the only
 * difference (#60).
 */
export const CHART_CARD = "rounded-lg border border-line p-4";
export const CHART_CARD_HEADER =
  "mb-3 flex items-center justify-between gap-2 border-b border-ink pb-1.5";
