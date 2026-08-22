import { type Machine, parseMachine } from "@washy-washy/core";

/**
 * The default machine location, relative to the repo root — mirroring the
 * same `data/machine.json[.dist]` convention `washy-washy-cli` uses. Not
 * something a shared package should hardcode: it's a repo-layout choice,
 * not chart/machine logic.
 */
export const DEFAULT_MACHINE = "data/machine.json";
export const DIST_MACHINE = `${DEFAULT_MACHINE}.dist`;

/**
 * Reads a machine file, falling back to the committed `.dist` beside it when
 * you have not written your own — the same arrangement as the chart, and for
 * the same reason. Test-support only: the app itself never reads a machine
 * file from disk, it bundles the `.dist` example at build time.
 */
export async function loadMachine(path: string): Promise<Machine> {
  const file = (await Bun.file(path).exists()) ? path : `${path}.dist`;
  if (!(await Bun.file(file).exists())) throw new Error(`no such machine file: ${path}`);

  let parsed: unknown;
  try {
    parsed = await Bun.file(file).json();
  } catch (error) {
    throw new Error(`${file} is not valid JSON: ${error instanceof Error ? error.message : error}`);
  }

  try {
    return parseMachine(parsed);
  } catch (error) {
    throw new Error(
      `${file}: ${error instanceof Error ? error.message.replace(/^machine: /, "") : error}`,
    );
  }
}
