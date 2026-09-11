import { describe, expect, test } from "bun:test";
import { isSecondGPress, isTypingTarget, KEY_BINDINGS } from "../src/lib/keyboardNav";

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

  test("is false when lastGPressAt is 0 — 'no press yet', even if now is within the threshold of zero", () => {
    // lastGPressAt === 0 means "nothing recent behind it" per this
    // module's own doc comment, so this must stay false even though
    // now - 0 is well within the threshold — a first `g` press should
    // never itself read as completing `gg`.
    expect(isSecondGPress(100, 0, 500)).toBe(false);
  });
});

describe("KEY_BINDINGS", () => {
  test("lists every binding with its exact keys and description key", () => {
    expect(KEY_BINDINGS).toEqual([
      { keys: "j", descriptionKey: "keyboardNav.scrollDown" },
      { keys: "k", descriptionKey: "keyboardNav.scrollUp" },
      { keys: "g g", descriptionKey: "keyboardNav.jumpTop" },
      { keys: "G", descriptionKey: "keyboardNav.jumpBottom" },
      { keys: "/", descriptionKey: "keyboardNav.focusSearch" },
      { keys: "?", descriptionKey: "keyboardNav.toggleHelp" },
      { keys: "Esc", descriptionKey: "keyboardNav.closeHelp" },
    ]);
  });
});
