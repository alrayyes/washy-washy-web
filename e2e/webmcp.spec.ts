import { expect, type Page, test } from "@playwright/test";
import { type Instruction, rowsFromInstructions } from "@washy-washy/core/browser";

const TOOL_NAMES = [
  "washy_get_config",
  "washy_validate_chart",
  "washy_set_chart",
  "washy_set_machine",
  "washy_export_pdf",
];

/**
 * `WebMcpBridge.svelte` registers its tools from `onMount`, after
 * `document.modelContext` itself exists (the polyfill installs it via a
 * dynamic import) — so waiting on `data-hydrated` alone isn't enough here,
 * the same reasoning `config.spec.ts`'s own `goto` documents for hydration.
 */
async function goto(page: Page) {
  await page.goto("/");
  await page.waitForSelector('[data-hydrated="true"]');
  await page.waitForFunction(async (expectedCount) => {
    const context = document.modelContext;
    if (!context) return false;
    const tools = await context.getTools();
    return tools.length === expectedCount;
  }, TOOL_NAMES.length);
}

/** `executeTool` takes the input object and returns the result as a JSON string — see `webmcp-global.d.ts`. */
async function callTool(page: Page, name: string, input: unknown): Promise<unknown> {
  const raw = await page.evaluate(
    async ({ name, input }) => {
      const context = document.modelContext;
      if (!context?.executeTool) throw new Error("document.modelContext.executeTool unavailable");
      const tools = await context.getTools();
      const tool = tools.find((candidate) => candidate.name === name);
      if (!tool) throw new Error(`no such tool: ${name}`);
      return context.executeTool(tool, input);
    },
    { name, input },
  );
  return raw === null ? null : JSON.parse(raw);
}

test("registers all five tools, discoverable by name and description", async ({ page }) => {
  await goto(page);

  const tools = await page.evaluate(async () => {
    const context = document.modelContext;
    return context ? context.getTools() : [];
  });

  expect(tools.map((tool) => tool.name).sort()).toEqual([...TOOL_NAMES].sort());
  for (const tool of tools) expect(tool.description.length).toBeGreaterThan(0);
});

test("washy_set_chart persists a valid edit through the real document.modelContext round trip", async ({
  page,
}) => {
  await goto(page);

  const { chart } = (await callTool(page, "washy_get_config", {})) as { chart: Instruction[] };
  const rows = rowsFromInstructions(chart).map((row, index) =>
    index === 0 ? { ...row, clothing_type: "WebMCP Edited Pile" } : row,
  );

  // A successful call reloads the page from inside the tool's own execute
  // (WebMcpBridge.svelte, matching HeaderUpload's existing precedent), so
  // the page.evaluate() carrying this call can reject once that reload
  // actually starts tearing down its execution context — not a real
  // failure, so it's tolerated rather than asserted on directly. What
  // matters is what ends up in storage, which survives the reload either way.
  await callTool(page, "washy_set_chart", { rows }).catch((error: unknown) => {
    if (!(error instanceof Error) || !/context.*destroyed/i.test(error.message)) throw error;
  });

  await page.waitForFunction(() =>
    (localStorage.getItem("washy-washy:config") ?? "").includes("WebMCP Edited Pile"),
  );
});
