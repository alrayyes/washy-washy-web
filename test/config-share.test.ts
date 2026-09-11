import { describe, expect, test } from "bun:test";
import {
  CONFIG_HASH_PREFIX,
  decodeConfigHash,
  encodeConfigHash,
  fromBase64Url,
  toBase64Url,
} from "../src/lib/configShare";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

describe("encodeConfigHash / decodeConfigHash", () => {
  test("round-trips a real config unchanged", async () => {
    const config = await loadConfig(DIST_CONFIG);

    const hash = await encodeConfigHash(config);
    const decoded = await decodeConfigHash(hash);

    expect(decoded).toEqual(config);
  });

  test("decodes without a leading # too, not just location.hash's own form", async () => {
    const config = await loadConfig(DIST_CONFIG);
    const hash = await encodeConfigHash(config);

    const decoded = await decodeConfigHash(hash.slice(1));

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

describe("toBase64Url / fromBase64Url", () => {
  // Every length from 0 to 6 bytes exercises all three base64 padding
  // cases (0, 1 and 2 trailing "=" before they're stripped) at least
  // twice — encodeConfigHash/decodeConfigHash only ever exercise whatever
  // padding a real compressed config happens to need, not all three.
  test.each([0, 1, 2, 3, 4, 5, 6])("round-trips %d byte(s) losslessly", (length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) bytes[i] = (i * 37 + 11) % 256;

    const encoded = toBase64Url(bytes);

    expect(encoded).not.toContain("=");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(fromBase64Url(encoded)).toEqual(bytes);
  });
});
