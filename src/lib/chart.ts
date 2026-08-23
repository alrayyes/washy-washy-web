import { configFromJson, type Machine, type ResolvedInstruction, resolve } from "@washy-washy/core";

export interface Chart {
  items: ResolvedInstruction[];
  machine: Machine;
}

/**
 * Turns the bundled config's raw file contents into what the sheet viewer
 * renders from.
 *
 * Takes content rather than reading the file itself: the page that calls
 * this pulls `washy-washy.json.dist` in via Vite's own static `?raw` import,
 * which resolves correctly wherever Rollup ends up placing the built chunk —
 * a path built from this file's own `import.meta.url` at runtime does not,
 * since the prerendered chunk lands at a different depth than the source
 * did.
 */
export function buildChart(configSource: string): Chart {
  const { machine, chart } = configFromJson(configSource);
  return { items: resolve(chart), machine };
}
