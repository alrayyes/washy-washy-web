import { describe, expect, test } from "bun:test";
import { normaliseLcov } from "../scripts/normalise-lcov";

describe("normaliseLcov", () => {
  test("leaves a plain record as it was", () => {
    const lcov = "TN:\nSF:src/a.ts\nFNF:1\nFNH:1\nDA:1,3\nLF:1\nLH:1\nend_of_record\n";
    expect(normaliseLcov(lcov)).toBe(lcov);
  });

  test("strips the ?client suffix from a file with only that record", () => {
    const out = normaliseLcov("TN:\nSF:src/a.svelte?client\nDA:1,2\nLF:1\nLH:1\nend_of_record\n");
    expect(out).toContain("SF:src/a.svelte\n");
    expect(out).not.toContain("?client");
  });

  test("merges the server and client records of a component, adding the hits", () => {
    const out = normaliseLcov(
      [
        "TN:\nSF:src/a.svelte\nDA:1,2\nDA:2,0\nLF:2\nLH:1\nend_of_record",
        "TN:\nSF:src/a.svelte?client\nDA:2,4\nDA:3,0\nLF:2\nLH:1\nend_of_record\n",
      ].join("\n"),
    );
    expect(out.match(/SF:src\/a\.svelte/g)).toHaveLength(1);
    expect(out).toContain("DA:1,2\nDA:2,4\nDA:3,0\n");
    expect(out).toContain("LF:3\nLH:2\n");
  });
});
