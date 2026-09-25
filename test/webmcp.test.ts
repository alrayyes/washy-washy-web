import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  type Config,
  configToJson,
  type Row,
  rowsFromInstructions,
} from "@washy-washy/core/browser";
import { PDFDocument } from "pdf-lib";
import { readCustomConfig } from "../src/lib/customConfig";
import { createWebMcpTools } from "../src/lib/webmcp";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

/** `bun:test` has no `localStorage` global — a browser API — so stand one in. */
class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

let original: typeof localStorage | undefined;

beforeEach(() => {
  original = (globalThis as { localStorage?: typeof localStorage }).localStorage;
  (globalThis as { localStorage: unknown }).localStorage = new MemoryStorage();
});

afterEach(() => {
  (globalThis as { localStorage?: typeof localStorage }).localStorage = original as never;
});

const bundled = await loadConfig(DIST_CONFIG);

function tool(name: string) {
  const found = createWebMcpTools("en").find((candidate) => candidate.name === name);
  if (!found) throw new Error(`no such tool: ${name}`);
  return found;
}

function rowsFromChart(config: Config): Row[] {
  return rowsFromInstructions(config.chart);
}

describe("createWebMcpTools", () => {
  test("declares the five documented tools", () => {
    const names = createWebMcpTools("en").map((t) => t.name);

    expect(names).toEqual([
      "washy_get_config",
      "washy_validate_chart",
      "washy_set_chart",
      "washy_set_machine",
      "washy_export_pdf",
    ]);
  });

  test("marks read-only tools and consequential tools distinctly", () => {
    expect(tool("washy_get_config").annotations).toEqual({ readOnlyHint: true });
    expect(tool("washy_set_chart").annotations).toEqual({ consequentialHint: true });
  });
});

describe("washy_get_config", () => {
  test("returns the bundled example when no custom config is active", async () => {
    const result = (await tool("washy_get_config").execute({})) as {
      chart: unknown;
      machine: unknown;
      isCustom: boolean;
    };

    expect(result.isCustom).toBe(false);
    expect(result.machine).toEqual(bundled.machine);
    expect(result.chart).toEqual(bundled.chart);
  });

  test("returns the saved config once one is active", async () => {
    const custom: Config = { ...bundled, chart: bundled.chart.slice(0, 1) };
    localStorage.setItem("washy-washy:config", configToJson(custom));

    const result = (await tool("washy_get_config").execute({})) as { isCustom: boolean };

    expect(result.isCustom).toBe(true);
  });
});

describe("washy_validate_chart", () => {
  test("accepts rows that fit the active machine, without saving anything", async () => {
    const rows = rowsFromChart(bundled);

    const result = (await tool("washy_validate_chart").execute({ rows })) as { valid: boolean };

    expect(result.valid).toBe(true);
    expect(readCustomConfig()).toBeNull();
  });

  test("reports the same row/column error the on-page editor would, for an unknown programme", async () => {
    const rows = rowsFromChart(bundled).map((row, index) =>
      index === 0 ? { ...row, program: "Not a real programme" } : row,
    );

    const result = (await tool("washy_validate_chart").execute({ rows })) as {
      valid: boolean;
      error?: string;
    };

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/row 2, column "program"/);
  });
});

describe("washy_set_chart", () => {
  test("persists a validated chart against the active machine", async () => {
    const rows = rowsFromChart(bundled).slice(0, 1);

    const result = (await tool("washy_set_chart").execute({ rows })) as { ok: boolean };

    expect(result.ok).toBe(true);
    expect(readCustomConfig()?.chart).toHaveLength(1);
  });

  test("saves nothing when a row doesn't fit the machine", async () => {
    const rows = rowsFromChart(bundled).map((row, index) =>
      index === 0 ? { ...row, temperature: "not a real temperature" } : row,
    );

    const result = (await tool("washy_set_chart").execute({ rows })) as {
      ok: boolean;
      error?: string;
    };

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/row 2, column "temperature"/);
    expect(readCustomConfig()).toBeNull();
  });
});

describe("washy_set_machine", () => {
  test("persists a new machine once the current chart still validates against it", async () => {
    const widerMachine = {
      washer: {
        ...bundled.machine.washer,
        options: [...bundled.machine.washer.options, "Extra rinse"],
      },
      iron: bundled.machine.iron,
    };

    const result = (await tool("washy_set_machine").execute(widerMachine)) as { ok: boolean };

    expect(result.ok).toBe(true);
    expect(readCustomConfig()?.machine.washer.options).toContain("Extra rinse");
  });

  test("saves nothing when the new machine breaks the current chart", async () => {
    const brokenMachine = {
      washer: { ...bundled.machine.washer, programs: ["Only programme"] },
      iron: bundled.machine.iron,
    };

    const result = (await tool("washy_set_machine").execute(brokenMachine)) as {
      ok: boolean;
      error?: string;
    };

    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(readCustomConfig()).toBeNull();
  });
});

describe("washy_export_pdf", () => {
  test("renders the phone layout for the active chart, base64-encoded", async () => {
    const result = (await tool("washy_export_pdf").execute({ layout: "phone" })) as {
      pdfBase64: string;
      filename: string;
      dropped: string[];
    };

    expect(result.filename).toBe("washing-instructions-phone.pdf");
    const bytes = Uint8Array.from(atob(result.pdfBase64), (char) => char.charCodeAt(0));
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0);
  });

  test("renders the print layout with the cut suffix in the filename", async () => {
    const result = (await tool("washy_export_pdf").execute({
      layout: "print",
      cut: "wash",
    })) as { filename: string };

    expect(result.filename).toBe("washing-instructions-print-washing.pdf");
  });
});
