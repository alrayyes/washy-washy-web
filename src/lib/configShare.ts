import { type Config, configFromJson, configToJson } from "@washy-washy/core/browser";

/**
 * Carries a custom machine/chart in the URL itself, compressed — the
 * no-server-involved way to hand someone your whole setup, not just the
 * filter state the page's own Share button already carries in its query
 * params (`url.ts`/`urlHistory.ts`, untouched by this). Kept out of the
 * query string on purpose: the hash fragment never reaches Cloudflare's
 * own access logs or an outbound link's Referer header, only client-side
 * JS ever sees it — the more private of the two choices for something
 * this size, on a site that otherwise sends nothing anywhere (#123).
 */
export const CONFIG_HASH_PREFIX = "config=";

/**
 * Exported for direct testing of the base64url round-trip at each padding
 * length (0/1/2 trailing `=`) — the surrounding `encode`/`decodeConfigHash`
 * pair only ever exercises whatever padding a real compressed config
 * happens to produce, not all three deterministically.
 */
export function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  // "=" only ever appears as base64's own trailing padding, never as data —
  // so stripping every "=" anywhere (plain replaceAll, not a `/=+$/` regex)
  // is equivalent for any real base64 string, and sidesteps an unkillable
  // "drop the trailing-anchor" mutant a regex version would carry (an
  // unanchored `/=+/ ` finds the same, only, run of "=" chars, so the two
  // would be indistinguishable to any test).
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function fromBase64Url(value: string): Uint8Array {
  const translated = value.replaceAll("-", "+").replaceAll("_", "/");
  // atob's own "forgiving-base64" decode (WHATWG-standardized, not a
  // Bun/JSC quirk) already tolerates a string missing its trailing "="
  // padding — confirmed empirically for every length this ever actually
  // sees (a real base64 string's stripped length mod 4 is always 0, 2 or
  // 3; 1 can never occur from encoding real bytes, and IS the only
  // remainder atob rejects). Padding back up to a multiple of 4 here never
  // changes what atob decodes, for any real input.
  // Stryker disable next-line ArithmeticOperator,StringLiteral
  const padded = translated.padEnd(Math.ceil(translated.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  // `bytes` has a fixed length of exactly binary.length — assigning one
  // index past the end of a TypedArray is a silent no-op in JS, not a
  // throw or a resize, confirmed empirically. An off-by-one here (`<=`)
  // is therefore unobservable in the returned array, for any input.
  // Stryker disable next-line EqualityOperator
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Compresses a config and returns the full `#config=...` hash fragment, ready to append to a URL. */
export async function encodeConfigHash(config: Config): Promise<string> {
  const json = configToJson(config);
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  return `#${CONFIG_HASH_PREFIX}${toBase64Url(compressed)}`;
}

/**
 * Decodes a `#config=...` hash fragment (as found on `location.hash`) back
 * into a `Config`. Throws the same row/column-scoped errors
 * `configFromJson` already gives an invalid upload — a corrupted or
 * hand-edited hash surfaces the same way a bad upload does, not a
 * different one. Returns `null` for a hash that doesn't carry a config at
 * all (nothing to decode, not an error).
 */
export async function decodeConfigHash(hash: string): Promise<Config | null> {
  // At most one leading "#" is stripped — `location.hash` always includes
  // it, but a caller passing the fragment without it (or a value that
  // starts with the prefix directly) should still work.
  const stripped = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!stripped.startsWith(CONFIG_HASH_PREFIX)) return null;
  const encoded = stripped.slice(CONFIG_HASH_PREFIX.length);
  const bytes = fromBase64Url(encoded);
  // `as any`, not `as BlobPart`: this file is also imported (for testing)
  // under tsconfig.test.json, which deliberately has no DOM lib — the
  // same reasoning `SheetViewer.tsx`'s `savePdf` needs a narrowing cast
  // for (TS types Uint8Array over the wider ArrayBufferLike, which also
  // covers SharedArrayBuffer, while a Blob part wants the plain
  // ArrayBuffer-backed kind — fromBase64Url's own `new
  // Uint8Array(binary.length)` is always a fresh, non-shared buffer, so
  // this is a safe cast either way), but naming `BlobPart` itself would
  // fail to resolve under that DOM-less config.
  // biome-ignore lint/suspicious/noExplicitAny: see above — the DOM type name itself isn't available under tsconfig.test.json
  const stream = new Blob([bytes as any]).stream().pipeThrough(new DecompressionStream("gzip"));
  const json = await new Response(stream).text();
  return configFromJson(json);
}
