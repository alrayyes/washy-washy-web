import { describe, expect, test } from "bun:test";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_LOCALE, type Locale } from "../src/i18n/locales";
import { TranslationProvider, useLocale, useT } from "../src/i18n/TranslationProvider";
import { translator } from "../src/i18n/ui";

/**
 * A nested consumer, exactly like Sheet.tsx's own Masthead/Loads/etc: React
 * has to actually render it (via `createElement`, not a bare function call)
 * for its `useT`/`useLocale` hook calls to be legal — see sheet-render.test.ts's
 * own comment on why Sheet's helpers are reached the same way.
 */
function Consumer() {
  const t = useT();
  const locale = useLocale();
  return createElement("span", null, `${locale}:${t("skip.toContent")}`);
}

/**
 * `createElement`'s variadic `(component, props, ...children)` overload
 * doesn't type-check here: TranslationProvider's own Props type marks
 * `children` required, and TS only accepts that combination through the
 * props object.
 */
function withLocale(locale: Locale, child: ReactElement) {
  // biome-ignore lint/correctness/noChildrenProp: see the doc comment above
  return createElement(TranslationProvider, { locale, children: child });
}

describe("TranslationProvider", () => {
  test("hands its own locale, and that locale's translator, down to useLocale/useT", () => {
    const html = renderToStaticMarkup(withLocale("ja", createElement(Consumer)));

    expect(html).toBe(`<span>ja:${translator("ja")("skip.toContent")}</span>`);
  });

  test("a different locale prop produces a different translator", () => {
    const en = renderToStaticMarkup(withLocale("en", createElement(Consumer)));
    const de = renderToStaticMarkup(withLocale("de", createElement(Consumer)));

    expect(en).not.toBe(de);
  });

  test("a consumer reached with no provider above it falls back to the default locale", () => {
    const html = renderToStaticMarkup(createElement(Consumer));

    expect(html).toBe(
      `<span>${DEFAULT_LOCALE}:${translator(DEFAULT_LOCALE)("skip.toContent")}</span>`,
    );
  });
});
