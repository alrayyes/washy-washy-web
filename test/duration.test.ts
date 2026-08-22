import { describe, expect, test } from "bun:test";
import { isValidDuration } from "../src/lib/duration";

describe("isValidDuration", () => {
  test("accepts empty — no duration set", () => {
    expect(isValidDuration("")).toBe(true);
  });

  test("accepts H:MM", () => {
    expect(isValidDuration("2:30")).toBe(true);
    expect(isValidDuration("0:45")).toBe(true);
  });

  test("accepts multi-digit hours", () => {
    expect(isValidDuration("12:05")).toBe(true);
  });

  test("rejects non-numeric text", () => {
    expect(isValidDuration("abc")).toBe(false);
  });

  test("rejects a minutes value of 60 or more", () => {
    expect(isValidDuration("1:60")).toBe(false);
  });

  test("rejects a missing colon", () => {
    expect(isValidDuration("230")).toBe(false);
  });

  test("rejects a single-digit minutes part", () => {
    expect(isValidDuration("2:3")).toBe(false);
  });

  test("rejects a leading ~ — callers strip it before validating", () => {
    expect(isValidDuration("~2:30")).toBe(false);
  });
});
