import { describe, expect, test } from "bun:test";

const SHEET_VIEWER = "src/components/SheetViewer.svelte";
const WEBMCP_LIB = "src/lib/webmcp.ts";
const WEBMCP_BRIDGE = "src/components/WebMcpBridge.svelte";

describe("SheetViewer", () => {
  test("does not statically import @washy-washy/pdf", async () => {
    const source = await Bun.file(SHEET_VIEWER).text();

    // A static `import ... from "@washy-washy/pdf"` ships @react-pdf/renderer
    // and pdf-lib in the page's main chunk even though nothing needs them
    // until the download button is clicked. Only a dynamic import() lets a
    // bundler split that weight into its own chunk, loaded on demand.
    expect(source).not.toMatch(/^import\s[^;]*from\s+["']@washy-washy\/pdf["']/m);
  });

  test("loads @washy-washy/pdf dynamically instead", async () => {
    const source = await Bun.file(SHEET_VIEWER).text();

    expect(source).toMatch(/import\(\s*["']@washy-washy\/pdf["']\s*\)/);
  });
});

describe("webmcp", () => {
  test("does not statically import @washy-washy/pdf", async () => {
    const source = await Bun.file(WEBMCP_LIB).text();

    expect(source).not.toMatch(/^import\s[^;]*from\s+["']@washy-washy\/pdf["']/m);
  });

  test("loads @washy-washy/pdf dynamically instead", async () => {
    const source = await Bun.file(WEBMCP_LIB).text();

    expect(source).toMatch(/import\(\s*["']@washy-washy\/pdf["']\s*\)/);
  });

  test("does not statically import @mcp-b/webmcp-polyfill", async () => {
    const source = await Bun.file(WEBMCP_BRIDGE).text();

    // Same reasoning as @washy-washy/pdf above: nothing on the page needs
    // WebMCP support until a WebMCP-aware caller shows up, so it shouldn't
    // cost every other visitor a single byte of their main chunk.
    expect(source).not.toMatch(/^import\s[^;]*from\s+["']@mcp-b\/webmcp-polyfill["']/m);
  });

  test("loads @mcp-b/webmcp-polyfill dynamically instead", async () => {
    const source = await Bun.file(WEBMCP_BRIDGE).text();

    expect(source).toMatch(/import\(\s*["']@mcp-b\/webmcp-polyfill["']\s*\)/);
  });
});
