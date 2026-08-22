import { type Config, configFromJson } from "@washy-washy/core";

/**
 * The default config location, relative to the repo root — mirroring the
 * same `data/washy-washy.json[.dist]` convention `washy-washy-cli` uses.
 */
export const DEFAULT_CONFIG = "data/washy-washy.json";
export const DIST_CONFIG = `${DEFAULT_CONFIG}.dist`;

/**
 * Reads a config file, falling back to the committed `.dist` beside it when
 * you have not written your own. Test-support only: the app itself never
 * reads a config file from disk, it bundles the `.dist` example at build
 * time.
 */
export async function loadConfig(path: string): Promise<Config> {
  const file = (await Bun.file(path).exists()) ? path : `${path}.dist`;
  if (!(await Bun.file(file).exists())) throw new Error(`no such config file: ${path}`);

  const source = await Bun.file(file).text();
  try {
    return configFromJson(source);
  } catch (error) {
    throw new Error(
      `${file}: ${error instanceof Error ? error.message.replace(/^config: /, "") : error}`,
    );
  }
}
