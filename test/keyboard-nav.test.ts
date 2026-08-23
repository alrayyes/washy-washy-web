import { describe, expect, test } from "bun:test";
import { isSecondGPress, isTypingTarget } from "../src/lib/keyboardNav";

describe("isTypingTarget", () => {
  test("is false for no target", () => {
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(undefined)).toBe(false);
  });

  test("is false for a plain element", () => {
    expect(isTypingTarget({ tagName: "ARTICLE" })).toBe(false);
    expect(isTypingTarget({ tagName: "BUTTON" })).toBe(false);
  });

  test("is true for an input, textarea or select", () => {
    expect(isTypingTarget({ tagName: "INPUT" })).toBe(true);
    expect(isTypingTarget({ tagName: "TEXTAREA" })).toBe(true);
    expect(isTypingTarget({ tagName: "SELECT" })).toBe(true);
  });

  test("is true for a contenteditable element regardless of tag", () => {
    expect(isTypingTarget({ tagName: "DIV", isContentEditable: true })).toBe(true);
  });
});

describe("isSecondGPress", () => {
  test("is false for a first g press (nothing recent behind it)", () => {
    expect(isSecondGPress(1_000, 0)).toBe(false);
  });

  test("is true for a second g press within the threshold", () => {
    expect(isSecondGPress(1_300, 1_000, 500)).toBe(true);
    // Right at the edge still counts.
    expect(isSecondGPress(1_500, 1_000, 500)).toBe(true);
  });

  test("is false once the threshold has passed", () => {
    expect(isSecondGPress(1_600, 1_000, 500)).toBe(false);
  });
});
