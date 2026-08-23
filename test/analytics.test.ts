import { describe, expect, test } from "bun:test";
import { readUmamiConfig } from "../src/lib/analytics";

describe("readUmamiConfig", () => {
  test("returns null when neither env var is set — the default, opt-in-only state", () => {
    expect(readUmamiConfig({})).toBeNull();
  });

  test("returns null when only the script URL is set", () => {
    expect(
      readUmamiConfig({ PUBLIC_UMAMI_SCRIPT_URL: "https://umami.example/script.js" }),
    ).toBeNull();
  });

  test("returns null when only the website ID is set", () => {
    expect(readUmamiConfig({ PUBLIC_UMAMI_WEBSITE_ID: "abc-123" })).toBeNull();
  });

  test("returns both values when both env vars are set — self-hosted or cloud, same shape either way", () => {
    expect(
      readUmamiConfig({
        PUBLIC_UMAMI_SCRIPT_URL: "https://umami.example/script.js",
        PUBLIC_UMAMI_WEBSITE_ID: "abc-123",
      }),
    ).toEqual({
      scriptUrl: "https://umami.example/script.js",
      websiteId: "abc-123",
    });
  });

  test("treats an empty string the same as unset", () => {
    expect(
      readUmamiConfig({ PUBLIC_UMAMI_SCRIPT_URL: "", PUBLIC_UMAMI_WEBSITE_ID: "abc-123" }),
    ).toBeNull();
  });
});
