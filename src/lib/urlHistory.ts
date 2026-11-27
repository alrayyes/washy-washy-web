import type { StoredFilters } from "./storage";

/**
 * Writes the current filters into the URL via `replaceState`, never
 * `pushState` — every keystroke in the pile search would otherwise push a
 * new history entry, turning the back button into an undo stack for typing
 * rather than real navigation. A filter left at its default (the full cut,
 * an empty search) is dropped rather than written as `cut=full&pile=`, so
 * the plain unfiltered view keeps a plain URL.
 *
 * Separate from `url.ts`'s `readUrlFilters`: this one touches `window`,
 * which `tsconfig.json` has no types for (see that file's comment).
 * `tsconfig.test.json` gets just enough of it from
 * `test/support/windowShim.d.ts`.
 */
export function writeUrlFilters(filters: StoredFilters): void {
  const params = new URLSearchParams();
  if (filters.cut !== "full") params.set("cut", filters.cut);
  if (filters.pileQuery !== "") params.set("pile", filters.pileQuery);
  if (filters.program !== "") params.set("program", filters.program);
  if (filters.temperature !== "") params.set("temperature", filters.temperature);
  if (filters.spin !== "") params.set("spin", filters.spin);
  if (filters.detergentQuery !== "") params.set("detergent", filters.detergentQuery);
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", url);
}
