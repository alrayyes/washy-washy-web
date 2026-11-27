import { describe, expect, test } from "bun:test";
import { latestFlag } from "../scripts/latest-flag";

describe("latestFlag", () => {
  test("marks the newest version latest", () => {
    expect(latestFlag("v1.54.0", ["v1.53.17", "v1.9.0"])).toBe("--latest");
  });

  test("leaves latest alone when a newer release is already published", () => {
    expect(latestFlag("v1.54.0", ["v1.54.1", "v1.53.17"])).toBe("--latest=false");
  });

  test("compares versions as numbers, not text", () => {
    expect(latestFlag("v1.9.0", ["v1.10.0"])).toBe("--latest=false");
  });
});
