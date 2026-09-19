import { describe, expect, test } from "bun:test";
import { render } from "svelte/server";
import SectionHeading from "../src/components/SectionHeading.svelte";

describe("SectionHeading (Svelte)", () => {
  test("renders the exact markup a card's uppercase label needs", () => {
    const { body } = render(SectionHeading, { props: { text: "Loads" } });

    // `svelte/server`'s `render()` always wraps a component's top-level
    // output in `<!--[-->`/`<!--]-->` hydration boundary markers
    // (renderer.js's `#open_render`) — unconditional, not something a
    // compile option turns off — so the Svelte version's exact string
    // isn't byte-identical to `renderToStaticMarkup`'s, only the element
    // itself (same tag, same class string, same uppercased text) is.
    expect(body).toBe(
      '<!--[--><p class="mb-1 text-xs font-bold tracking-wide text-muted">LOADS</p><!--]-->',
    );
  });

  test("uppercases every character, not just the first", () => {
    const { body } = render(SectionHeading, { props: { text: "mixed Case text" } });

    expect(body).toContain("MIXED CASE TEXT");
    expect(body).not.toContain("mixed");
  });
});
