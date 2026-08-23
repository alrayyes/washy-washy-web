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

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
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
  const stripped = hash.replace(/^#/, "");
  if (!stripped.startsWith(CONFIG_HASH_PREFIX)) return null;
  const encoded = stripped.slice(CONFIG_HASH_PREFIX.length);
  const bytes = fromBase64Url(encoded);
  // Same narrowing SheetViewer.tsx's savePdf already needs: TS types
  // Uint8Array over the wider ArrayBufferLike (which also covers
  // SharedArrayBuffer), while BlobPart wants the plain ArrayBuffer-backed
  // kind — fromBase64Url's own `new Uint8Array(binary.length)` is always
  // a fresh, non-shared buffer, so this is a safe cast, not a real risk.
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const json = await new Response(stream).text();
  return configFromJson(json);
}
