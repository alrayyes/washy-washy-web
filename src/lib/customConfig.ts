import { type Config, configFromJson, configToJson } from "@washy-washy/core/browser";

const KEY = "washy-washy:config";

/**
 * A previously uploaded or edited config (machine + chart together), read
 * back for a returning visit.
 *
 * Re-validated on every read, the same as a fresh upload — not just trusted
 * because it was valid when it was written. A config that no longer
 * validates (hand-edited storage, a schema change) falls back to the
 * bundled one instead of rendering nonsense, the same as any other storage
 * failure here.
 */
export function readCustomConfig(): Config | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    return configFromJson(raw);
  } catch {
    return null;
  }
}

export function writeCustomConfig(config: Config): void {
  try {
    localStorage.setItem(KEY, configToJson(config));
  } catch {
    // Private browsing, a full quota, or no storage at all — the edit
    // still renders for this visit, it just isn't remembered next time.
  }
}

export function clearCustomConfig(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do if storage itself is unavailable — there was nothing
    // reliably stored to begin with.
  }
}
