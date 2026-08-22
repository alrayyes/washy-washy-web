import type { ResolvedInstruction } from "@washy-washy/core/browser";

/**
 * Narrows the chart to piles whose name contains `query`, case-insensitively.
 * An empty or whitespace-only query keeps every pile — that is "no filter
 * applied", not "match nothing".
 */
export function filterByPile(items: ResolvedInstruction[], query: string): ResolvedInstruction[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return items;
  return items.filter((item) => item.clothingType.toLowerCase().includes(needle));
}

/**
 * The machine-facing fields beyond pile name — programme, temperature and
 * spin are exact matches against one of the active machine's own defined
 * values (rendered as selects, never free text: there's no such thing as
 * a "close" programme name), detergent is a substring search like
 * `filterByPile`, since it's free text in the chart too (#8).
 */
export interface AdvancedFilters {
  program: string;
  temperature: string;
  spin: string;
  detergentQuery: string;
}

/** Every field empty — matches everything, applies via `hasActiveAdvancedFilters` below. */
export const emptyAdvancedFilters: AdvancedFilters = {
  program: "",
  temperature: "",
  spin: "",
  detergentQuery: "",
};

export function hasActiveAdvancedFilters(filters: AdvancedFilters): boolean {
  return (
    filters.program !== "" ||
    filters.temperature !== "" ||
    filters.spin !== "" ||
    filters.detergentQuery.trim() !== ""
  );
}

/**
 * Narrows by every non-empty field in `filters`, combined as AND — call
 * this on the result of `filterByPile` (or vice versa) to combine pile
 * search with the advanced fields, also AND, not OR (#8).
 */
export function filterAdvanced(
  items: ResolvedInstruction[],
  filters: AdvancedFilters,
): ResolvedInstruction[] {
  const detergentNeedle = filters.detergentQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (filters.program !== "" && item.program !== filters.program) return false;
    if (filters.temperature !== "" && item.temperature !== filters.temperature) return false;
    if (filters.spin !== "" && item.spin !== filters.spin) return false;
    if (detergentNeedle !== "" && !item.detergent.toLowerCase().includes(detergentNeedle)) {
      return false;
    }
    return true;
  });
}
