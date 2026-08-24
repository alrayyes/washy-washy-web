import { describe, expect, test } from "bun:test";
import { richText } from "../src/i18n/richText";

describe("richText", () => {
  test("passes plain text through untouched", () => {
    expect(richText("no markup here")).toBe("no markup here");
  });

  test("escapes HTML-significant characters in plain text", () => {
    expect(richText(`<script> & "quotes"`)).toBe("&lt;script&gt; &amp; &quot;quotes&quot;");
  });

  test("turns [label](url) into a link, keeping the url exact", () => {
    expect(richText("Uses [Umami](https://umami.is/) for stats.")).toBe(
      'Uses <a href="https://umami.is/" class="underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent">Umami</a> for stats.',
    );
  });

  test("turns `code` into a code span", () => {
    expect(richText("saved in `localStorage`.")).toBe(
      'saved in <code class="text-sm text-ink">localStorage</code>.',
    );
  });

  test("turns *emphasis* into <em>", () => {
    expect(richText("Chrome's *⋮* menu")).toBe("Chrome's <em>⋮</em> menu");
  });

  test("handles a mix of markup and escapes surrounding text", () => {
    expect(richText('Safari & Chrome\'s *⋮* menu both have "Add to Home Screen".')).toBe(
      "Safari &amp; Chrome's <em>⋮</em> menu both have &quot;Add to Home Screen&quot;.",
    );
  });
});
