import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

// `washy-washy` on its own is the CLI's old name, and GitHub redirects it there.
const OLD_NAME = /github\.com\/alrayyes\/washy-washy(?![\w-])/;

const sources = [
  "astro.config.mjs",
  ...new Bun.Glob("src/**/*.{astro,svelte,ts,md,mdx}").scanSync(),
];

describe("repository links", () => {
  test("nothing the site ships links the old repository name", () => {
    expect(sources.filter((file) => OLD_NAME.test(readFileSync(file, "utf8")))).toEqual([]);
  });
});
