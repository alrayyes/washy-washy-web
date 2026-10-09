// Rewrites bun's lcov.info so lcov's own tools can read it. bun names the
// client build of a Svelte component `Foo.svelte?client`, which is not a file,
// so genhtml stops on it. This strips the suffix and merges the two records
// each such component then has, adding the hits for each line. A file with a
// single record keeps all of it. Run as
// `bun scripts/normalise-lcov.ts <in> <out>`; the original stays the one
// that is published.
import { readFile, writeFile } from "node:fs/promises";

interface FileRecord {
  lines: string[];
  hits: Map<number, number>;
}

export function normaliseLcov(lcov: string): string {
  const records = new Map<string, FileRecord[]>();
  for (const block of lcov.split("end_of_record")) {
    const lines = block.split("\n").filter((line) => line !== "" && !line.startsWith("TN:"));
    const sf = lines.find((line) => line.startsWith("SF:"));
    if (sf === undefined) continue;
    const name = sf.slice(3).replace(/\?client$/, "");
    const hits = new Map<number, number>();
    for (const line of lines) {
      if (!line.startsWith("DA:")) continue;
      const [no, count] = line.slice(3).split(",").map(Number);
      hits.set(no as number, count as number);
    }
    records.set(name, [...(records.get(name) ?? []), { lines, hits }]);
  }

  const out: string[] = [];
  for (const [name, group] of records) {
    out.push("TN:", `SF:${name}`);
    const [only] = group;
    if (group.length === 1 && only !== undefined) {
      out.push(...only.lines.filter((line) => !line.startsWith("SF:")));
    } else {
      const merged = new Map<number, number>();
      for (const { hits } of group) {
        for (const [no, count] of hits) merged.set(no, (merged.get(no) ?? 0) + count);
      }
      const sorted = [...merged].sort(([a], [b]) => a - b);
      out.push(...sorted.map(([no, count]) => `DA:${no},${count}`));
      out.push(`LF:${sorted.length}`, `LH:${sorted.filter(([, count]) => count > 0).length}`);
    }
    out.push("end_of_record");
  }
  return `${out.join("\n")}\n`;
}

if (import.meta.main) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.error("usage: bun scripts/normalise-lcov.ts <in> <out>");
    process.exit(2);
  }
  await writeFile(output, normaliseLcov(await readFile(input, "utf8")));
}
