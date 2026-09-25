import {
  COLUMNS,
  type Config,
  configFromJson,
  type Instruction,
  type Iron,
  instructionsFromRows,
  MAX_WASHER_OPTION_LENGTH,
  MAX_WASHER_PROGRAM_LENGTH,
  MAX_WASHER_SPIN_LENGTH,
  MAX_WASHER_TEMPERATURE_LENGTH,
  parseMachine,
  type Row,
  resolve,
  rowsFromInstructions,
  type Variant,
  variants,
  type Washer,
} from "@washy-washy/core/browser";
import { configSourceFor } from "../i18n/configSource";
import type { Locale } from "../i18n/locales";
import { readCustomConfig, writeCustomConfig } from "./customConfig";

/**
 * Everything a WebMCP tool needs, kept plain and DOM-free — the actual
 * `document.modelContext.registerTool()` call lives in `WebMcpBridge.svelte`,
 * so this module is unit-testable the same way `customConfig.ts` is.
 */
export interface WebMcpToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: true } | { consequentialHint: true };
  execute: (input: unknown) => unknown;
}

const PDF_STEM = "washing-instructions";
const PDF_SUFFIX: Record<Variant, string> = { full: "", wash: "-washing", iron: "-ironing" };

/** The same fallback every page/island already applies: a saved edit wins, otherwise the bundled example for this locale. */
function effectiveConfig(locale: Locale): Config {
  return readCustomConfig() ?? configFromJson(configSourceFor(locale));
}

function rowsInputSchema() {
  return {
    type: "object",
    properties: {
      rows: {
        type: "array",
        items: {
          type: "object",
          properties: Object.fromEntries(COLUMNS.map((column) => [column, { type: "string" }])),
          required: [...COLUMNS],
        },
      },
    },
    required: ["rows"],
  };
}

function stringArraySchema(maxLength: number) {
  return { type: "array", items: { type: "string", maxLength } };
}

function machineInputSchema() {
  return {
    type: "object",
    properties: {
      washer: {
        type: "object",
        properties: {
          name: { type: "string", maxLength: 60 },
          capacity: { type: "string", maxLength: 30 },
          programs: stringArraySchema(MAX_WASHER_PROGRAM_LENGTH),
          temperatures: stringArraySchema(MAX_WASHER_TEMPERATURE_LENGTH),
          spins: stringArraySchema(MAX_WASHER_SPIN_LENGTH),
          options: stringArraySchema(MAX_WASHER_OPTION_LENGTH),
        },
        required: ["name", "capacity", "programs", "temperatures", "spins", "options"],
      },
      iron: {
        type: "object",
        properties: {
          name: { type: "string", maxLength: 60 },
          settings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string", maxLength: 30 },
                dots: { type: "string", maxLength: 5 },
                label: { type: "string", maxLength: 20 },
                detail: { type: "string", maxLength: 60 },
                steam: { type: "boolean" },
              },
              required: ["key", "dots", "label", "detail", "steam"],
            },
          },
        },
        required: ["name", "settings"],
      },
    },
    required: ["washer", "iron"],
  };
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/** Chunked to avoid `String.fromCharCode(...bytes)` blowing the call stack on a large PDF. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

/**
 * The 5 WebMCP tools washy-washy-web exposes so a browser agent can read,
 * validate and edit the active chart/machine, and request a PDF, against
 * `@washy-washy/core`'s own validation — see #270. `locale` picks the
 * bundled fallback when no custom config is active, the same as every page.
 */
export function createWebMcpTools(locale: Locale): WebMcpToolDef[] {
  return [
    {
      name: "washy_get_config",
      description:
        "Read the laundry chart and machine currently active on washy-washy-web — the uploaded or edited one, or the bundled example if none is active.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: () => {
        const config = effectiveConfig(locale);
        return {
          chart: config.chart,
          machine: config.machine,
          isCustom: readCustomConfig() !== null,
        };
      },
    },
    {
      name: "washy_validate_chart",
      description:
        "Validate laundry chart rows against the currently active machine, without saving anything — the same check the on-page chart editor runs on Save.",
      inputSchema: rowsInputSchema(),
      annotations: { readOnlyHint: true },
      execute: (input) => {
        const { rows } = input as { rows: Row[] };
        try {
          const chart = instructionsFromRows(rows, effectiveConfig(locale).machine);
          return { valid: true, chart };
        } catch (reason) {
          return { valid: false, error: errorMessage(reason) };
        }
      },
    },
    {
      name: "washy_set_chart",
      description:
        "Replace the active chart with the given rows, validated against the currently active machine — the same as Save on the /config page.",
      inputSchema: rowsInputSchema(),
      annotations: { consequentialHint: true },
      execute: (input) => {
        const { rows } = input as { rows: Row[] };
        const current = effectiveConfig(locale);
        try {
          const chart = instructionsFromRows(rows, current.machine);
          writeCustomConfig({ machine: current.machine, chart });
          return { ok: true };
        } catch (reason) {
          return { ok: false, error: errorMessage(reason) };
        }
      },
    },
    {
      name: "washy_set_machine",
      description:
        "Replace the active washer and iron, re-validating the current chart against them — the same as Save on the /config/machine page.",
      inputSchema: machineInputSchema(),
      annotations: { consequentialHint: true },
      execute: (input) => {
        const { washer, iron } = input as { washer: Washer; iron: Iron };
        const current = effectiveConfig(locale);
        try {
          const machine = parseMachine({ washer, iron });
          const chart: Instruction[] = instructionsFromRows(
            rowsFromInstructions(current.chart),
            machine,
          );
          writeCustomConfig({ machine, chart });
          return { ok: true };
        } catch (reason) {
          return { ok: false, error: errorMessage(reason) };
        }
      },
    },
    {
      name: "washy_export_pdf",
      description:
        "Render the active chart as a PDF, the same as the front page's download buttons — returned as base64 rather than downloaded.",
      inputSchema: {
        type: "object",
        properties: {
          layout: { type: "string", enum: ["phone", "print"] },
          cut: { type: "string", enum: [...variants] },
        },
        required: ["layout"],
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const { layout, cut = "full" } = input as { layout: "phone" | "print"; cut?: Variant };
        const config = effectiveConfig(locale);
        const items = resolve(config.chart);
        const { renderPhone, renderPrint } = await import("@washy-washy/pdf");
        const { pdf, dropped } =
          layout === "phone"
            ? await renderPhone(items, config.machine, cut)
            : await renderPrint(items, config.machine, cut);
        return {
          pdfBase64: toBase64(pdf),
          filename: `${PDF_STEM}-${layout}${PDF_SUFFIX[cut]}.pdf`,
          dropped,
        };
      },
    },
  ];
}
