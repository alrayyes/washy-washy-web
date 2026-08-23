import { describe, expect, test } from "bun:test";
import { CONFIG_HASH_PREFIX, decodeConfigHash, encodeConfigHash } from "../src/lib/configShare";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

describe("encodeConfigHash / decodeConfigHash", () => {
  test("round-trips a real config unchanged", async () => {
    const config = await loadConfig(DIST_CONFIG);

    const hash = await encodeConfigHash(config);
    const decoded = await decodeConfigHash(hash);

    expect(decoded).toEqual(config);
  });

  test("the hash starts with the expected prefix, ready to append to a URL", async () => {
    const config = await loadConfig(DIST_CONFIG);

    const hash = await encodeConfigHash(config);

    expect(hash.startsWith(`#${CONFIG_HASH_PREFIX}`)).toBe(true);
  });

  test("returns null for a hash that carries no config at all", async () => {
    expect(await decodeConfigHash("")).toBeNull();
    expect(await decodeConfigHash("#cut=full&pile=sock")).toBeNull();
  });

  test("throws the same row/column-scoped error configFromJson gives an invalid upload, for a corrupted hash", async () => {
    await expect(decodeConfigHash("#config=not-valid-base64url-gzip-at-all")).rejects.toThrow();
  });
});
