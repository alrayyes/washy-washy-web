import { describe, expect, test } from "bun:test";
import { resolve, variants } from "@washy-washy/core";
import { renderPhone } from "@washy-washy/pdf";
import { PDFDocument } from "pdf-lib";
import { buildChart } from "../src/lib/chart";
import { emptyAdvancedFilters, filterAdvanced, filterByPile } from "../src/lib/filter";
import { DIST_CONFIG, loadConfig } from "./support/loadConfig";

async function loadWebChart() {
  const configSource = await Bun.file(DIST_CONFIG).text();
  return buildChart(configSource);
}

describe("buildChart", () => {
  test("parses the same items and machine the CLI draws the bundled examples from", async () => {
    const { machine, chart: instructions } = await loadConfig(DIST_CONFIG);
    const expected = resolve(instructions);

    const chart = await loadWebChart();

    expect(chart.machine).toEqual(machine);
    expect(chart.items).toEqual(expected);
  });
});

describe("filterByPile", () => {
  test("keeps every pile when the query is empty or blank", async () => {
    const { items } = await loadWebChart();

    expect(filterByPile(items, "")).toEqual(items);
    expect(filterByPile(items, "   ")).toEqual(items);
  });

  test("matches by substring, case-insensitively", async () => {
    const { items } = await loadWebChart();

    const matches = filterByPile(items, "sock");

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.length).toBeLessThan(items.length);
    for (const item of matches) expect(item.clothingType.toLowerCase()).toContain("sock");
  });

  test("matches nothing rather than falling back to everything", async () => {
    const { items } = await loadWebChart();

    expect(filterByPile(items, "no such pile")).toEqual([]);
  });
});

describe("filterAdvanced", () => {
  test("keeps every pile when every field is empty", async () => {
    const { items } = await loadWebChart();

    expect(filterAdvanced(items, emptyAdvancedFilters)).toEqual(items);
  });

  test("matches by exact programme", async () => {
    const { items } = await loadWebChart();
    const program = items[0]?.program as string;

    const matches = filterAdvanced(items, { ...emptyAdvancedFilters, program });

    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) expect(item.program).toBe(program);
  });

  test("matches by exact temperature", async () => {
    const { items } = await loadWebChart();
    const temperature = items[0]?.temperature as string;

    const matches = filterAdvanced(items, { ...emptyAdvancedFilters, temperature });

    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) expect(item.temperature).toBe(temperature);
  });

  test("matches by exact spin", async () => {
    const { items } = await loadWebChart();
    const spin = items[0]?.spin as string;

    const matches = filterAdvanced(items, { ...emptyAdvancedFilters, spin });

    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) expect(item.spin).toBe(spin);
  });

  test("matches detergent by substring, case-insensitively", async () => {
    const { items } = await loadWebChart();

    const matches = filterAdvanced(items, { ...emptyAdvancedFilters, detergentQuery: "POWDER" });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.length).toBeLessThan(items.length);
    for (const item of matches) expect(item.detergent.toLowerCase()).toContain("powder");
  });

  test("combines fields as AND, not OR", async () => {
    const { items } = await loadWebChart();
    const target = items.find((item) => item.temperature !== items[0]?.temperature);
    if (!target)
      throw new Error("bundled chart needs at least two distinct temperatures for this test");

    const matches = filterAdvanced(items, {
      ...emptyAdvancedFilters,
      program: items[0]?.program as string,
      temperature: target.temperature,
    });

    // items[0]'s own programme, but a temperature it doesn't have — the
    // combination should match strictly fewer piles than either field alone.
    expect(matches.length).toBeLessThan(
      filterAdvanced(items, { ...emptyAdvancedFilters, program: items[0]?.program as string })
        .length,
    );
  });

  test("combines with filterByPile as AND", async () => {
    const { items } = await loadWebChart();
    const pileFiltered = filterByPile(items, "sock");
    const program = pileFiltered[0]?.program as string;

    const both = filterAdvanced(pileFiltered, { ...emptyAdvancedFilters, program });

    expect(both.length).toBeGreaterThan(0);
    for (const item of both) {
      expect(item.clothingType.toLowerCase()).toContain("sock");
      expect(item.program).toBe(program);
    }
  });
});

describe("renderPhone from the web chart", () => {
  for (const variant of variants) {
    test(`fits the ${variant} cut on one page, the same as the CLI`, async () => {
      const { items, machine } = await loadWebChart();

      const { pdf } = await renderPhone(items, machine, variant);

      expect((await PDFDocument.load(pdf)).getPageCount()).toBe(1);
    });
  }
});
