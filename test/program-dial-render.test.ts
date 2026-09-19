import { describe, expect, test } from "bun:test";
import type { Machine } from "@washy-washy/core";
import { render } from "svelte/server";
import ProgramDial from "../src/components/ProgramDial.svelte";

function washer(programs: string[]): Machine["washer"] {
  return {
    name: "Test washer",
    capacity: "8kg",
    programs,
    temperatures: [],
    spins: [],
    options: [],
  };
}

/**
 * A test-owned reimplementation of dialGeometry.ts's own `polar`/`arc`
 * functions — not a copy-paste of the source, but the same universal
 * point-on-a-circle formula anyone would write for this. Comparing rendered
 * output against a value computed independently (rather than only checking
 * "a path exists") is what catches a sign flip or an off-by-one constant in
 * the source's own arithmetic. Duplicated from test/dials-render.test.ts
 * (the React version's own test file), which doesn't export these helpers.
 */
function refPolar(cx: number, cy: number, radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function refArc(cx: number, cy: number, radius: number, from: number, to: number): string {
  const start = refPolar(cx, cy, radius, from);
  const end = refPolar(cx, cy, radius, to);
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Every `<tag ...>` opening tag in document order, as an order-independent
 * attribute map. `svelte/server`'s `render()` emits self-closing-ish SVG
 * elements the same way `react-dom/server` does (real opening tags with
 * attributes), so this only needs to find the opening tag itself.
 */
function parseTags(html: string, tag: string): Record<string, string>[] {
  const tagPattern = new RegExp(`<${tag}\\b([^>]*)>`, "g");
  const attrPattern = /([a-zA-Z0-9-]+)="([^"]*)"/g;
  return [...html.matchAll(tagPattern)].map((match) => {
    const attrs: Record<string, string> = {};
    for (const [, name, value] of (match[1] ?? "").matchAll(attrPattern)) {
      if (name) attrs[name] = value ?? "";
    }
    return attrs;
  });
}

function num(attrs: Record<string, string>, key: string): number {
  const value = attrs[key];
  if (value === undefined)
    throw new Error(`missing attribute "${key}" in ${JSON.stringify(attrs)}`);
  return Number(value);
}

function closeToPoint(actual: { x: number; y: number }, expected: { x: number; y: number }): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
}

function renderDial(props: { program: string; washer: Machine["washer"]; size?: number }): string {
  return render(ProgramDial, { props }).body;
}

describe("ProgramDial (Svelte)", () => {
  const CENTRE = 38; // size 76 / 2
  const OUTER = CENTRE - 3;
  const KNOB = OUTER * 0.45;

  test("draws exactly one ring arc, one tick per program, a knob and a pointer", () => {
    const html = renderDial({ program: "B", washer: washer(["A", "B", "C", "D"]) });

    expect(html).toContain("<svg");
    expect(parseTags(html, "path")).toHaveLength(1);
    expect(parseTags(html, "line")).toHaveLength(4 + 1); // 4 ticks + pointer
    expect(parseTags(html, "circle")).toHaveLength(2); // knob + centre dot
  });

  test("defaults to a 76px square viewBox, honours an explicit size", () => {
    const defaultHtml = renderDial({ program: "A", washer: washer(["A"]) });
    expect(defaultHtml).toContain('width="76"');
    expect(defaultHtml).toContain('height="76"');
    expect(defaultHtml).toContain('viewBox="0 0 76 76"');

    const sizedHtml = renderDial({ program: "A", washer: washer(["A"]), size: 40 });
    expect(sizedHtml).toContain('width="40"');
    expect(sizedHtml).toContain('height="40"');
    expect(sizedHtml).toContain('viewBox="0 0 40 40"');
  });

  test.each([2, 4])(
    "draws the ring arc at exactly the geometry the maths predicts (%i programs)",
    (count) => {
      const programs = Array.from({ length: count }, (_, i) => `P${i}`);
      const step = 360 / count;
      const html = renderDial({ program: "P0", washer: washer(programs) });

      const [ring] = parseTags(html, "path");
      expect(ring).toBeDefined();
      expect(ring?.d).toBe(refArc(CENTRE, CENTRE, OUTER, step * 0.6, 360 - step * 0.6));
      expect(ring?.stroke).toBe("var(--color-accent)");
      expect(ring?.["stroke-width"]).toBe("0.8");
    },
  );

  test("draws every tick at its own angle, growing and recolouring only the selected one", () => {
    const programs = ["Cottons", "Synthetics", "Delicates", "Wool", "Quick"];
    const step = 360 / programs.length;
    const selectedIndex = 2;
    const html = renderDial({
      program: programs[selectedIndex] as string,
      washer: washer(programs),
    });

    const lines = parseTags(html, "line");
    const ticks = lines.slice(0, programs.length);
    const pointer = lines[programs.length];

    programs.forEach((_, position) => {
      const selected = position === selectedIndex;
      const angle = position * step;
      const inner = refPolar(CENTRE, CENTRE, selected ? KNOB + 1 : OUTER - 4.5, angle);
      const edge = refPolar(CENTRE, CENTRE, selected ? OUTER + 1.5 : OUTER, angle);
      const tick = ticks[position];
      expect(tick).toBeDefined();
      if (!tick) return;

      closeToPoint({ x: num(tick, "x1"), y: num(tick, "y1") }, inner);
      closeToPoint({ x: num(tick, "x2"), y: num(tick, "y2") }, edge);
      expect(tick.stroke).toBe(selected ? "var(--color-accent)" : "var(--color-faint)");
      expect(tick["stroke-width"]).toBe(selected ? "2" : "0.7");
    });

    const pointerEnd = refPolar(CENTRE, CENTRE, KNOB - 1.5, selectedIndex * step);
    expect(pointer).toBeDefined();
    if (pointer) {
      closeToPoint({ x: num(pointer, "x1"), y: num(pointer, "y1") }, { x: CENTRE, y: CENTRE });
      closeToPoint({ x: num(pointer, "x2"), y: num(pointer, "y2") }, pointerEnd);
      expect(pointer.stroke).toBe("var(--color-accent)");
      expect(pointer["stroke-width"]).toBe("2");
    }
  });

  test("the knob and centre dot are drawn at fixed radii regardless of the selection", () => {
    const html = renderDial({ program: "B", washer: washer(["A", "B", "C"]) });
    const [knob, dot] = parseTags(html, "circle");

    expect(knob).toBeDefined();
    expect(dot).toBeDefined();
    if (!knob || !dot) return;

    expect(num(knob, "cx")).toBeCloseTo(CENTRE);
    expect(num(knob, "cy")).toBeCloseTo(CENTRE);
    expect(num(knob, "r")).toBeCloseTo(KNOB);
    expect(knob.fill).toBe("var(--color-knob)");
    expect(knob.stroke).toBe("var(--color-line)");
    expect(knob["stroke-width"]).toBe("0.8");

    expect(num(dot, "cx")).toBeCloseTo(CENTRE);
    expect(num(dot, "cy")).toBeCloseTo(CENTRE);
    expect(num(dot, "r")).toBeCloseTo(1.6);
    expect(dot.fill).toBe("var(--color-accent)");
  });

  test("an unrecognised program falls back to the first position, not a crash", () => {
    const html = renderDial({ program: "does-not-exist", washer: washer(["A", "B"]) });

    const known = renderDial({ program: "A", washer: washer(["A", "B"]) });
    expect(html).toBe(known);
  });
});
