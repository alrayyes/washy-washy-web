import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const pins = readdirSync(new URL("../.github/workflows/", import.meta.url)).flatMap((file) =>
  [...read(`.github/workflows/${file}`).matchAll(/bun-version: (\S+)/g)].map((match) => match[1]),
);

describe("the pinned bun version", () => {
  test("is the same in every workflow", () => {
    expect(pins.length).toBeGreaterThan(0);
    expect(new Set(pins).size).toBe(1);
  });

  test("is one the Stryker bun runner supports", () => {
    const runner = JSON.parse(read("node_modules/@hughescr/stryker-bun-runner/package.json"));

    for (const pin of pins)
      expect(Bun.semver.satisfies(String(pin), runner.engines.bun)).toBe(true);
  });

  test.each(["README.md", "CONTRIBUTING.md"])("is the one %s asks for", (doc) => {
    expect(read(doc)).toContain(`[Bun](https://bun.sh/) ${pins[0]}`);
  });
});
