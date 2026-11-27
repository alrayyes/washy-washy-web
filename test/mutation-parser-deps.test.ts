import { describe, expect, test } from "bun:test";
import { dirname } from "node:path";

describe("mutation testing of Svelte files", () => {
  // Stryker imports estree-walker from svelte's directory when it parses a
  // .svelte file, and neither package depends on it. No grep finds that, and
  // CI only mutates files a pull request touches.
  test("estree-walker resolves from svelte", () => {
    const svelte = dirname(Bun.resolveSync("svelte/package.json", process.cwd()));

    expect(() => Bun.resolveSync("estree-walker", svelte)).not.toThrow();
  });
});
