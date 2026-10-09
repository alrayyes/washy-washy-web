import { expect, test } from "bun:test";
import { Glob } from "bun";

// An <img> with no width and height reserves no space until the file loads,
// so everything under it jumps (Lighthouse's cls-culprits-insight blamed the
// docs list under the first screenshot for 0.31 of layout shift).
test("every docs screenshot declares its size", async () => {
  const missing: string[] = [];
  for await (const path of new Glob("src/content/docs/**/*.{md,mdx}").scan(".")) {
    const source = await Bun.file(path).text();
    for (const tag of source.match(/<img\b[^>]*>/g) ?? []) {
      if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
        missing.push(`${path}: ${tag.slice(0, 80)}`);
      }
    }
  }
  expect(missing).toEqual([]);
});
