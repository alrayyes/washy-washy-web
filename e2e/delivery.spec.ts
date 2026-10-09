import { expect, test } from "@playwright/test";

/**
 * Cache and compression headers as Cloudflare sends them. These specs run
 * against `wrangler dev` (the "delivery" server in playwright.config.ts), not
 * scripts/serve-dist.ts: the plain file server sends no `_headers` rules and
 * no compression, so it can say nothing about either.
 */
test.use({ baseURL: "http://127.0.0.1:4322" });

const PAGES = ["/", "/config/", "/docs/"];

test.describe("pages", () => {
  for (const path of PAGES) {
    test(`${path} revalidates and is compressed`, async ({ request }) => {
      const response = await request.get(path, { headers: { "accept-encoding": "br, gzip" } });
      expect(response.headers()["cache-control"]).toBe("no-cache");
      expect(response.headers()["content-encoding"]).toMatch(/^(br|gzip)$/);
    });
  }
});

test.describe("fingerprinted assets", () => {
  test("are cached for a year and compressed", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const assets = [...html.matchAll(/(?:href|src)="(\/_astro\/[^"]+\.(?:css|js))"/g)].map(
      (match) => match[1],
    );
    expect(assets.length).toBeGreaterThan(0);

    for (const asset of assets) {
      const response = await request.get(asset, { headers: { "accept-encoding": "br, gzip" } });
      expect(response.headers()["cache-control"], asset).toBe(
        "public, max-age=31536000, immutable",
      );
      expect(response.headers()["content-encoding"], asset).toMatch(/^(br|gzip)$/);
    }
  });
});
