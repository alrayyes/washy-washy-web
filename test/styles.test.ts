import { describe, expect, test } from "bun:test";
import {
  ALERT,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  CHART_CARD,
  CHART_CARD_HEADER,
  FIELD_LABEL,
  LINK,
  SECTION_HEADING,
  TEXT_INPUT,
} from "../src/lib/styles";

// These constants are shared Tailwind class strings, not free-form
// copy — an empty or truncated value is a silent visual/accessibility
// regression (a missing focus ring, a missing disabled state), not
// something a build or typecheck would ever catch. Exact-value
// assertions are the only thing that catches that class of bug here.
describe("shared style class strings", () => {
  test("TEXT_INPUT", () => {
    expect(TEXT_INPUT).toBe(
      "w-full min-w-[8rem] rounded border border-line bg-transparent px-1 py-0.5 text-body focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    );
  });

  test("FIELD_LABEL", () => {
    expect(FIELD_LABEL).toBe("text-xs font-semibold tracking-wide text-body uppercase");
  });

  test("BUTTON_PRIMARY", () => {
    expect(BUTTON_PRIMARY).toBe(
      "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    );
  });

  test("BUTTON_SECONDARY", () => {
    expect(BUTTON_SECONDARY).toBe(
      "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    );
  });

  test("ALERT", () => {
    expect(ALERT).toBe("rounded-md border border-no/30 bg-no/5 px-3 py-2 text-sm text-no-text");
  });

  test("CARD", () => {
    expect(CARD).toBe("rounded-lg border border-hairline bg-panel p-4");
  });

  test("SECTION_HEADING", () => {
    expect(SECTION_HEADING).toBe("mb-2 font-heading text-xl font-bold text-ink");
  });

  test("LINK", () => {
    expect(LINK).toBe(
      "underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent",
    );
  });

  test("CHART_CARD", () => {
    expect(CHART_CARD).toBe("rounded-lg border border-line p-4");
  });

  test("CHART_CARD_HEADER", () => {
    expect(CHART_CARD_HEADER).toBe(
      "mb-3 flex items-center justify-between gap-2 border-b border-ink pb-1.5",
    );
  });
});
