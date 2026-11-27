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
  test("reads the newest version heading — release-please writes newest-first", () => {
    expect(latestVersion(SAMPLE)).toBe("1.45.1");
  });

  test("reads every digit of each part", () => {
    expect(latestVersion("## [10.20.30](url) (2026-11-27)\n")).toBe("10.20.30");
  });

  test("ignores a heading quoted in the middle of a line", () => {
    expect(latestVersion("The shape is ## [9.9.9].\n\n## [1.2.3](url)\n")).toBe("1.2.3");
  });

  test("returns null when the changelog has no version heading yet", () => {
    expect(latestVersion("# Changelog\n\nNothing released yet.\n")).toBeNull();
  });

  test("returns null for an empty changelog", () => {
    expect(latestVersion("")).toBeNull();
  });
});
