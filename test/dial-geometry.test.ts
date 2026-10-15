import { describe, expect, test } from "bun:test";
import { segments } from "../src/lib/dialGeometry";

describe("segments", () => {
  test("joins each segment as its own M…L subpath", () => {
    expect(
      segments([
        { from: { x: 1, y: 2 }, to: { x: 3, y: 4 } },
        { from: { x: 5, y: 6 }, to: { x: 7, y: 8 } },
      ]),
    ).toBe("M 1 2 L 3 4 M 5 6 L 7 8");
  });

  test("returns an empty path for no segments", () => {
    expect(segments([])).toBe("");
  });

  test("rounds coordinates to three decimals, so float noise stays out of the markup", () => {
    expect(
      segments([{ from: { x: 6.123233995736766e-17, y: 1.23456789 }, to: { x: 2, y: 3.0004 } }]),
    ).toBe("M 0 1.235 L 2 3");
  });
});
