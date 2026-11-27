import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const lockfile = readFileSync(new URL("../bun.lock", import.meta.url), "utf8");

// An override once held playwright-core back while Dependabot moved
// @playwright/test on, which crashed e2e (#380).
describe("playwright-core", () => {
  test("resolves once, at the version playwright depends on", () => {
    const resolved = [...lockfile.matchAll(/\["playwright-core@([^"]+)"/g)].map(([, v]) => v);
    const wanted = lockfile.match(/"playwright-core": "([^"]+)" \}, "bin"/)?.[1];

    expect(wanted).toBeDefined();
    expect(resolved).toEqual([wanted as string]);
  });
});
