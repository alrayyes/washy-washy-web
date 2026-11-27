import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// release-please's own default: it inserts a new changelog entry in front of
// the first match, so a heading on line 1 (no newline before it) is skipped
// and the entry lands under the previous release.
// https://github.com/googleapis/release-please/blob/main/src/updaters/changelog.ts
const NEXT_ENTRY_GOES_BEFORE = /\n###? v?[0-9[]/;

describe("release-please configuration", () => {
  test("puts the next changelog entry above the newest one", () => {
    const changelog = read("CHANGELOG.md");

    expect(changelog.search(NEXT_ENTRY_GOES_BEFORE) + 1).toBe(changelog.search(/^## \[/m));
  });

  test("keeps tags in the vX.Y.Z shape", () => {
    expect(JSON.parse(read("release-please-config.json"))["include-component-in-tag"]).toBe(false);
  });

  test("holds a release as a draft, with its tag, until the screenshots are on it", () => {
    const config = JSON.parse(read("release-please-config.json"));

    expect(config.draft).toBe(true);
    expect(config["force-tag-creation"]).toBe(true);
    expect(read(".github/workflows/release.yml")).toContain("--draft=false");
  });
});
