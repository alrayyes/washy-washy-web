import { describe, expect, test } from "bun:test";
import { slug } from "../src/lib/slug";

describe("slug", () => {
  test("lowercases the name", () => {
    expect(slug("White Towels")).toBe("white-towels");
  });

  test("replaces runs of non-alphanumeric characters with a single dash", () => {
    expect(slug("Socks & Underwear!!")).toBe("socks-underwear");
  });

  test("strips leading and trailing dashes rather than leaving them", () => {
    expect(slug("!Iron Only!")).toBe("iron-only");
  });

  test("strips diacritics via NFKD normalization, not just passes them through", () => {
    expect(slug("Décolleté")).toBe("decollete");
  });

  test("keeps digits, doesn't treat them as separators", () => {
    expect(slug("Cottons 60")).toBe("cottons-60");
  });

  test("collapses a run of separators (spaces and punctuation together) into one dash", () => {
    expect(slug("Wool  /  Silk")).toBe("wool-silk");
  });
});
