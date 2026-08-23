import { describe, expect, test } from "bun:test";
import { resolve, variants } from "@washy-washy/core";
import { renderPhone } from "@washy-washy/pdf";
import { PDFDocument } from "pdf-lib";
import { buildChart } from "../src/lib/chart";
import {
  computeFacets,
  emptyAdvancedFilters,
  facetOptions,
  filterAdvanced,
  filterByPile,
} from "../src/lib/filter";
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

describe("computeFacets", () => {
  test("with no active filters, every field's facet is exactly the values piles actually use", async () => {
    const { items } = await loadWebChart();

    const facets = computeFacets(items, "", emptyAdvancedFilters);

    expect(new Set(facets.programs)).toEqual(new Set(items.map((item) => item.program)));
    expect(new Set(facets.temperatures)).toEqual(new Set(items.map((item) => item.temperature)));
    expect(new Set(facets.spins)).toEqual(new Set(items.map((item) => item.spin)));
  });

  test("a machine capability no pile actually uses never appears in its own facet", async () => {
    const { machine, items } = await loadWebChart();
    const usedPrograms = new Set(items.map((item) => item.program));
    const unusedProgram = machine.washer.programs.find((program) => !usedPrograms.has(program));
    if (!unusedProgram) {
      throw new Error("bundled machine needs a programme no pile uses for this test");
    }

    const facets = computeFacets(items, "", emptyAdvancedFilters);

    expect(facets.programs).not.toContain(unusedProgram);
  });

  test("a field's own current selection doesn't narrow its own facet", async () => {
    const { items } = await loadWebChart();
    const program = items[0]?.program as string;

    const facets = computeFacets(items, "", { ...emptyAdvancedFilters, program });

    // Every programme still reachable once temperature/spin/detergent are
    // left at "any" — picking a programme never removes other programmes
    // from its own select, so switching between them stays possible (#118).
    expect(new Set(facets.programs)).toEqual(new Set(items.map((item) => item.program)));
  });

  test("another field's active filter narrows a field's facet live", async () => {
    const { items } = await loadWebChart();
    const program = items[0]?.program as string;
    const programTemperatures = new Set(
      items.filter((item) => item.program === program).map((item) => item.temperature),
    );
    const otherTemperature = items
      .map((item) => item.temperature)
      .find((temperature) => !programTemperatures.has(temperature));
    if (!otherTemperature) {
      throw new Error("bundled chart needs a temperature that programme never uses for this test");
    }

    const facets = computeFacets(items, "", { ...emptyAdvancedFilters, program });

    expect(facets.temperatures).not.toContain(otherTemperature);
  });

  test("a combination with no matches leaves the remaining field's facet empty", async () => {
    const { items } = await loadWebChart();
    const program = items[0]?.program as string;
    const programTemperatures = new Set(
      items.filter((item) => item.program === program).map((item) => item.temperature),
    );
    const deadEndTemperature = items
      .map((item) => item.temperature)
      .find((temperature) => !programTemperatures.has(temperature));
    if (!deadEndTemperature) {
      throw new Error("bundled chart needs a temperature that programme never uses for this test");
    }

    const facets = computeFacets(items, "", {
      ...emptyAdvancedFilters,
      program,
      temperature: deadEndTemperature,
    });

    expect(facets.spins).toEqual([]);
  });

  test("respects the pile search, the same as the chart itself", async () => {
    const { items } = await loadWebChart();
    const sockPrograms = new Set(filterByPile(items, "sock").map((item) => item.program));

    const facets = computeFacets(items, "sock", emptyAdvancedFilters);

    expect(new Set(facets.programs)).toEqual(sockPrograms);
  });
});

describe("facetOptions", () => {
  test("keeps the machine's own declared order, narrowed to the facet", () => {
    const machineValues = ["Off", "Cottons", "Wool", "Delicates / Silk"];

    expect(facetOptions(machineValues, ["Wool", "Cottons"], "")).toEqual(["Cottons", "Wool"]);
  });

  test("keeps the current selection visible even once it's fallen out of the facet", () => {
    const machineValues = ["Off", "Cottons", "Wool"];

    expect(facetOptions(machineValues, ["Cottons"], "Wool")).toEqual(["Cottons", "Wool"]);
  });

  test("doesn't duplicate the current selection when it's already in the facet", () => {
    const machineValues = ["Off", "Cottons", "Wool"];

    expect(facetOptions(machineValues, ["Cottons", "Wool"], "Wool")).toEqual(["Cottons", "Wool"]);
  });

  test("is empty when nothing is selected and nothing in the facet matches", () => {
    const machineValues = ["Off", "Cottons", "Wool"];

    expect(facetOptions(machineValues, [], "")).toEqual([]);
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
