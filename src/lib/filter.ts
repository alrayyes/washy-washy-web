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

/** The select-backing values each of the three exact-match Advanced fields can still take. */
export interface AdvancedFacets {
  programs: string[];
  temperatures: string[];
  spins: string[];
}

type ExactField = "program" | "temperature" | "spin";

/**
 * Which values of `program`/`temperature`/`spin` would still narrow the
 * chart to at least one pile, given the pile search and every OTHER active
 * Advanced field — never a field's own current selection, so switching
 * between two still-valid values in the same select stays possible without
 * the box narrowing to just the current pick (#118). The machine's own
 * capability list can (and does, for the bundled example) name a value no
 * pile actually uses, or a combination that's individually valid per field
 * but empty together with another already-selected filter — this is what
 * keeps a select from ever offering one of those.
 */
export function computeFacets(
  items: ResolvedInstruction[],
  pileQuery: string,
  filters: AdvancedFilters,
): AdvancedFacets {
  const pileFiltered = filterByPile(items, pileQuery);

  function valuesFor(field: ExactField): string[] {
    const withoutField = filterAdvanced(pileFiltered, { ...filters, [field]: "" });
    return Array.from(new Set(withoutField.map((item) => item[field])));
  }

  return {
    programs: valuesFor("program"),
    temperatures: valuesFor("temperature"),
    spins: valuesFor("spin"),
  };
}

/**
 * A field's own `<select>` options: the machine's full declared list,
 * narrowed to whichever values `computeFacets` says can still match — kept
 * in the machine's own order, so the list doesn't reshuffle as filters
 * change — plus the field's current selection even where a later filter
 * change dropped it from that set, so a choice that just became a dead end
 * stays visibly selected rather than silently disappearing from the box.
 */
export function facetOptions(machineValues: string[], facet: string[], current: string): string[] {
  const allowed = new Set(facet);
  const options = machineValues.filter((value) => allowed.has(value));
  if (current !== "" && !options.includes(current)) options.push(current);
  return options;
}
