/**
 * `document.modelContext` (WebMCP, webmachinelearning.github.io/webmcp) isn't
 * in TypeScript's own DOM lib yet — it's an experimental W3C draft, Chrome
 * origin trial only. `@mcp-b/webmcp-polyfill` ships full types for it
 * (`@mcp-b/webmcp-types`, a transitive dependency), but those model the
 * spec's whole JSON-Schema-to-TypeScript inference machinery, which
 * `src/lib/webmcp.ts` doesn't use — every tool there takes `unknown` and
 * narrows it itself. This is just enough of the shape to type-check
 * `registerTool`/`getTools` the way this repo actually calls them, the same
 * "only as much typing as this file needs" as `starlight-virtual.d.ts` (#114).
 */
interface WebMcpRegisteredTool {
  name: string;
  description: string;
}

interface WebMcpModelContext {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema?: Record<string, unknown>;
      annotations?: Record<string, boolean>;
      execute: (input: unknown) => unknown;
    },
    options?: { signal?: AbortSignal },
  ): Promise<void>;
  getTools(): Promise<WebMcpRegisteredTool[]>;
  /** Chromium/polyfill extension for invoking a tool from outside the page — e2e tests only, the app never calls this on itself. */
  executeTool?(tool: WebMcpRegisteredTool, inputJson: string): Promise<string | null>;
}

declare global {
  interface Document {
    /** Absent unless a browser has native WebMCP, or the polyfill installed it. */
    modelContext?: WebMcpModelContext;
  }
}

export {};
