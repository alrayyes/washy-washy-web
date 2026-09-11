import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import SectionHeading from "../src/components/SectionHeading";

describe("SectionHeading", () => {
  test("renders the exact markup a card's uppercase label needs", () => {
    const html = renderToStaticMarkup(SectionHeading({ children: "Loads" }));

    expect(html).toBe('<p class="mb-1 text-xs font-bold tracking-wide text-muted">LOADS</p>');
  });

  test("uppercases every character, not just the first", () => {
    const html = renderToStaticMarkup(SectionHeading({ children: "mixed Case text" }));

    expect(html).toContain("MIXED CASE TEXT");
    expect(html).not.toContain("mixed");
  });
});
