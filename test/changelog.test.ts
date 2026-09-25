import { describe, expect, test } from "bun:test";
import { latestVersion } from "../src/lib/changelog";

const SAMPLE = `## [1.45.1](https://github.com/alrayyes/washy-washy-web/compare/v1.45.0...v1.45.1) (2026-09-25)

### Bug Fixes

* **lint:** exclude .claude/ from markdownlint, not just Biome ([#272](https://github.com/alrayyes/washy-washy-web/issues/272))

## [1.45.0](https://github.com/alrayyes/washy-washy-web/compare/v1.44.2...v1.45.0) (2026-09-22)

### Features

* **lint:** check Tailwind class usage with @shadcn/lint via Oxlint
`;

describe("latestVersion", () => {
  test("reads the newest version heading — semantic-release always writes newest-first", () => {
    expect(latestVersion(SAMPLE)).toBe("1.45.1");
  });

  test("returns null when the changelog has no version heading yet", () => {
    expect(latestVersion("# Changelog\n\nNothing released yet.\n")).toBeNull();
  });

  test("returns null for an empty changelog", () => {
    expect(latestVersion("")).toBeNull();
  });
});
