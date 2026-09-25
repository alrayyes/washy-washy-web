<!--
  Global, header-mounted (`SiteHeader.astro`) — same placement rule as
  `ThemeToggle`/`HeaderUpload`/`KeyboardNav`: a site-wide capability lives in
  the header, not repeated per page. Renders nothing: this island's only job
  is registering the WebMCP tools in `lib/webmcp.ts` against
  `document.modelContext` once mounted (#270), so a WebMCP-aware browser or
  extension can read, validate and edit the active chart/machine the same
  way this app's own editors do.

  `@mcp-b/webmcp-polyfill` installs `document.modelContext` when a browser
  has no native implementation yet (every browser, as of writing) — a no-op
  once one does. Dynamic-imported, the same as `@washy-washy/pdf`: nothing
  here should cost bytes for a visitor whose browser never calls a tool.

  `washy_set_chart`/`washy_set_machine` reload the page after a successful
  write, exactly like `HeaderUpload.svelte` already does after an upload —
  there's no shared reactive store between the editor islands for a tool
  call to update live, so a reload is how an open editor picks up the
  change.
-->
<script lang="ts">
import { onMount } from "svelte";
import type { Locale } from "../i18n/locales";
import { createWebMcpTools, type WebMcpToolDef } from "../lib/webmcp";

interface Props {
  locale: Locale;
}

const { locale }: Props = $props();

function reloadOnSuccess(tool: WebMcpToolDef): WebMcpToolDef {
  if (!("consequentialHint" in tool.annotations)) return tool;
  return {
    ...tool,
    execute: async (input) => {
      const result = await tool.execute(input);
      if (result && typeof result === "object" && "ok" in result && result.ok === true) {
        window.location.reload();
      }
      return result;
    },
  };
}

onMount(() => {
  let cancelled = false;

  (async () => {
    const { initializeWebMCPPolyfill } = await import("@mcp-b/webmcp-polyfill");
    initializeWebMCPPolyfill();

    const modelContext = document.modelContext;
    if (!modelContext || cancelled) return;

    for (const tool of createWebMcpTools(locale)) {
      if (cancelled) return;
      await modelContext.registerTool(reloadOnSuccess(tool));
    }
  })();

  return () => {
    cancelled = true;
  };
});
</script>
