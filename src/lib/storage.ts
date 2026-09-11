import { type Variant, variants } from "@washy-washy/core/browser";
import type { AdvancedFilters } from "./filter";

const KEY = "washy-washy:filters";

export interface StoredFilters extends AdvancedFilters {
  cut: Variant;
  pileQuery: string;
}

function isVariant(value: unknown): value is Variant {
  // The typeof guard is pure TS type-narrowing, not a runtime necessity:
  // Array.prototype.includes uses strict equality, so a non-string value
  // can never match a string in `variants` regardless. Confirmed
  // equivalent either way.
  // Stryker disable next-line ConditionalExpression
  return typeof value === "string" && (variants as readonly string[]).includes(value);
}

/** A field this repo added after `cut`/`pileQuery` shipped — a value stored before #8 won't have it, so it falls back to "no filter" rather than being rejected outright. */
function readOptionalString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * The last cut/pile/advanced filter, read back for a returning visit.
 *
 * Wrapped in a `try`, not just an availability check: private browsing can
 * throw on `localStorage` itself rather than leaving it `undefined`, a full
 * quota throws on write, and a stray non-JSON or wrong-shaped value under
 * this key (an older format, a manual edit) should be ignored rather than
 * crash the page. Any of those means "nothing to restore", never "the app
 * doesn't load".
 */
export function readFilters(): StoredFilters | null {
  try {
    const raw = localStorage.getItem(KEY);
    // Not load-bearing on its own: JSON.parse(null) coerces to the string
    // "null" and parses to the value `null`, which the `parsed === null`
    // check two lines below already rejects. Kept for the early, more
    // specific return rather than relying on that.
    // Stryker disable next-line ConditionalExpression
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    // The first two clauses below are individually redundant given the
    // rest of this check and the surrounding try/catch, confirmed by
    // inspection:
    //  - `typeof parsed !== "object"`: whenever parsed is a non-null
    //    primitive, `.cut` access is always `undefined` (primitives have
    //    no such property), which `isVariant` always rejects anyway.
    //  - `parsed === null`: `typeof null === "object"` in JS, so the
    //    clause above can't catch it — but disabling this one instead
    //    just makes `parsed.cut` throw on a null `parsed`, and that throw
    //    is caught by this function's own try/catch and still returns
    //    null to the caller. Externally indistinguishable either way.
    // Stryker disable ConditionalExpression,LogicalOperator
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      // Stryker restore ConditionalExpression,LogicalOperator
      !isVariant((parsed as Record<string, unknown>).cut) ||
      typeof (parsed as Record<string, unknown>).pileQuery !== "string"
    ) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    return {
      cut: record.cut as Variant,
      pileQuery: record.pileQuery as string,
      program: readOptionalString(record.program),
      temperature: readOptionalString(record.temperature),
      spin: readOptionalString(record.spin),
      detergentQuery: readOptionalString(record.detergentQuery),
    };
  } catch {
    return null;
  }
}

export function writeFilters(filters: StoredFilters): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(filters));
  } catch {
    // Private browsing, a full quota, or no storage at all — the filter
    // still works for this visit, it just doesn't carry over to the next.
  }
}
