/**
 * `svelte`'s own ambient `declare module "*.svelte"` (in
 * `node_modules/svelte/types/index.d.ts`) only ever types a component's
 * default export — it has no way to know about a *specific* `.svelte`
 * file's own `<script module>` exports, since plain `tsc` (this repo's
 * "typecheck" script, unlike `svelte-check`) never actually reads a
 * `.svelte` file's own source to extract its real shape. `Sheet.svelte` is
 * the one component in this repo that exports plain values
 * (`ironCardKey`/`sheetGroups`) alongside its default export.
 *
 * Confirmed empirically: a *more specific* wildcard pattern (one whose
 * non-wildcard portion is a longer, still-unique suffix — a pattern
 * ending in "components/Sheet.svelte" rather than just ".svelte") does
 * **not** take precedence over svelte's own bare `"*.svelte"` for a plain
 * import — svelte's pattern
 * wins regardless. What does work is **declaration merging**: another
 * `declare module "*.svelte"` block, anywhere in the same program, merges
 * its exports into the same ambient module rather than conflicting with
 * it, the same way merging two `interface Foo { ... }` blocks does. This
 * is deliberately loose — it tells every `.svelte` import in the program
 * it *could* have these two named exports, not just `Sheet.svelte` — but
 * nothing else ever imports them, so nothing else is ever wrong in
 * practice, and it's the only mechanism that's actually been confirmed to
 * work here without depending on svelte-check (which this repo's plain
 * `tsc`-based "typecheck" script doesn't run).
 */
declare module "*.svelte" {
  import type { Machine, ResolvedInstruction, Variant } from "@washy-washy/core/browser";

  export function ironCardKey(item: ResolvedInstruction): string;
  export function sheetGroups(
    items: ResolvedInstruction[],
    machine: Machine,
    variant: Variant,
  ): ResolvedInstruction[][];
}

/**
 * The `?client` suffix (test/support/svelteCompile.ts's own dual-mode
 * compile) has no ambient match of its own at all — unlike a plain
 * `.svelte` import, nothing declares this pattern by default. Same shape
 * as svelte's own `"*.svelte"` default export, plus the same
 * `Sheet.svelte`-specific named exports merged in above.
 */
declare module "*.svelte?client" {
  import type { Component } from "svelte";

  export function ironCardKey(
    item: import("@washy-washy/core/browser").ResolvedInstruction,
  ): string;
  export function sheetGroups(
    items: import("@washy-washy/core/browser").ResolvedInstruction[],
    machine: import("@washy-washy/core/browser").Machine,
    variant: import("@washy-washy/core/browser").Variant,
  ): import("@washy-washy/core/browser").ResolvedInstruction[][];

  // biome-ignore lint/suspicious/noExplicitAny: a wildcard ambient module can't know a specific component's own prop shape
  const Comp: Component<any>;
  export default Comp;
}
