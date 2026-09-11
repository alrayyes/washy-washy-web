import { describe, expect, test } from "bun:test";
import type { Machine } from "@washy-washy/core";
import { renderToStaticMarkup } from "react-dom/server";
import { IronDial, ProgramDial } from "../src/components/dials";

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

function ironSettings(
  entries: Array<{ key: string; steam: boolean }>,
): Machine["iron"]["settings"] {
  return entries.map(({ key, steam }) => ({ key, dots: "", label: key, detail: "", steam }));
}

/**
 * A test-owned reimplementation of dials.tsx's own private `polar`/`arc`
 * helpers — not a copy-paste of the source, but the same universal
 * point-on-a-circle formula anyone would write for this. Comparing rendered
 * output against a value computed independently (rather than only checking
 * "a path exists") is what catches a sign flip or an off-by-one constant in
 * the source's own arithmetic.
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
 * attribute map. `react-dom/server` renders SVG elements with real closing
 * tags (`<circle ...></circle>`), not `<circle ... />`, so this only needs
 * to find the opening tag itself.
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

describe("ProgramDial", () => {
  const CENTRE = 38; // size 76 / 2
  const OUTER = CENTRE - 3;
  const KNOB = OUTER * 0.45;

  test("draws exactly one ring arc, one tick per program, a knob and a pointer", () => {
    const html = renderToStaticMarkup(
      ProgramDial({ program: "B", washer: washer(["A", "B", "C", "D"]) }),
    );

    expect(html).toContain("<svg");
    expect(parseTags(html, "path")).toHaveLength(1);
    expect(parseTags(html, "line")).toHaveLength(4 + 1); // 4 ticks + pointer
    expect(parseTags(html, "circle")).toHaveLength(2); // knob + centre dot
  });

  test("defaults to a 76px square viewBox, honours an explicit size", () => {
    const defaultHtml = renderToStaticMarkup(ProgramDial({ program: "A", washer: washer(["A"]) }));
    expect(defaultHtml).toContain('width="76"');
    expect(defaultHtml).toContain('height="76"');
    expect(defaultHtml).toContain('viewBox="0 0 76 76"');

    const sizedHtml = renderToStaticMarkup(
      ProgramDial({ program: "A", washer: washer(["A"]), size: 40 }),
    );
    expect(sizedHtml).toContain('width="40"');
    expect(sizedHtml).toContain('height="40"');
    expect(sizedHtml).toContain('viewBox="0 0 40 40"');
  });

  test.each([2, 4])(
    "draws the ring arc at exactly the geometry the maths predicts (%i programs)",
    (count) => {
      const programs = Array.from({ length: count }, (_, i) => `P${i}`);
      const step = 360 / count;
      const html = renderToStaticMarkup(ProgramDial({ program: "P0", washer: washer(programs) }));

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
    const html = renderToStaticMarkup(
      ProgramDial({ program: programs[selectedIndex] as string, washer: washer(programs) }),
    );

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
    const html = renderToStaticMarkup(
      ProgramDial({ program: "B", washer: washer(["A", "B", "C"]) }),
    );
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
    const html = renderToStaticMarkup(
      ProgramDial({ program: "does-not-exist", washer: washer(["A", "B"]) }),
    );

    const known = renderToStaticMarkup(ProgramDial({ program: "A", washer: washer(["A", "B"]) }));
    expect(html).toBe(known);
  });
});

describe("IronDial", () => {
  const CENTRE = 38; // size 76 / 2
  const OUTER = CENTRE - 3;
  const KNOB = OUTER * 0.42;
  const SWEEP = 280;
  const FIRST = -SWEEP / 2;

  function angleOf(position: number, positionsCount: number): number {
    const step = SWEEP / Math.max(1, positionsCount - 1);
    return (FIRST + position * step + 360) % 360;
  }

  test("draws the ring, one tick per setting, a knob and a pointer when not off", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: false },
      { key: "hot", steam: false },
    ]);
    const html = renderToStaticMarkup(IronDial({ setting: "warm", settings }));

    expect(parseTags(html, "path")).toHaveLength(1); // ring only, no steam
    expect(parseTags(html, "line")).toHaveLength(3 + 1); // 3 ticks + pointer
    expect(parseTags(html, "circle")).toHaveLength(2); // knob + centre dot
  });

  test("defaults to a 76px square viewBox, honours an explicit size", () => {
    const settings = ironSettings([{ key: "cool", steam: false }]);
    const defaultHtml = renderToStaticMarkup(IronDial({ setting: "cool", settings }));
    expect(defaultHtml).toContain('width="76"');
    expect(defaultHtml).toContain('viewBox="0 0 76 76"');

    const sizedHtml = renderToStaticMarkup(IronDial({ setting: "cool", settings, size: 50 }));
    expect(sizedHtml).toContain('width="50"');
    expect(sizedHtml).toContain('viewBox="0 0 50 50"');
  });

  test("the ring always spans the same fixed 280 degree sweep, off or not", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "hot", steam: false },
    ]);
    const on = renderToStaticMarkup(IronDial({ setting: "cool", settings }));
    const off = renderToStaticMarkup(IronDial({ setting: "cool", settings, off: true }));

    const expected = refArc(CENTRE, CENTRE, OUTER, angleOf(0, 2), angleOf(0, 2) + SWEEP);
    expect(parseTags(on, "path")[0]?.d).toBe(expected);
    expect(parseTags(off, "path")[0]?.d).toBe(expected);
    expect(parseTags(on, "path")[0]?.stroke).toBe("var(--color-line)");
    expect(parseTags(off, "path")[0]?.stroke).toBe("var(--color-hairline)");
  });

  test("a single setting doesn't divide by zero and still draws one tick at the ring's start", () => {
    const settings = ironSettings([{ key: "only", steam: false }]);
    const html = renderToStaticMarkup(IronDial({ setting: "only", settings }));

    const [tick] = parseTags(html, "line");
    expect(tick).toBeDefined();
    if (!tick) return;
    // The only tick is also selected: outer - 9 / outer + 1.5, at angleOf(0, 1).
    const angle = angleOf(0, 1);
    const inner = refPolar(CENTRE, CENTRE, OUTER - 9, angle);
    const edge = refPolar(CENTRE, CENTRE, OUTER + 1.5, angle);
    closeToPoint({ x: num(tick, "x1"), y: num(tick, "y1") }, inner);
    closeToPoint({ x: num(tick, "x2"), y: num(tick, "y2") }, edge);
  });

  test("draws every tick at its own angle, growing and recolouring only the selected one", () => {
    const keys = ["cool", "mild", "warm", "hot", "extra"];
    const settings = ironSettings(keys.map((key) => ({ key, steam: false })));
    const selectedIndex = 3;
    const html = renderToStaticMarkup(
      IronDial({ setting: keys[selectedIndex] as string, settings }),
    );

    const lines = parseTags(html, "line");
    const ticks = lines.slice(0, keys.length);
    const pointer = lines[keys.length];

    keys.forEach((_, position) => {
      const selected = position === selectedIndex;
      const angle = angleOf(position, keys.length);
      const inner = refPolar(CENTRE, CENTRE, OUTER - (selected ? 9 : 5), angle);
      const edge = refPolar(CENTRE, CENTRE, OUTER + (selected ? 1.5 : 0), angle);
      const tick = ticks[position];
      expect(tick).toBeDefined();
      if (!tick) return;

      closeToPoint({ x: num(tick, "x1"), y: num(tick, "y1") }, inner);
      closeToPoint({ x: num(tick, "x2"), y: num(tick, "y2") }, edge);
      expect(tick.stroke).toBe(selected ? "var(--color-accent)" : "var(--color-faint)");
      expect(tick["stroke-width"]).toBe(selected ? "2" : "0.7");
    });

    const pointerAngle = angleOf(selectedIndex, keys.length);
    const pointerEnd = refPolar(CENTRE, CENTRE, KNOB - 1.5, pointerAngle);
    expect(pointer).toBeDefined();
    if (pointer) {
      closeToPoint({ x: num(pointer, "x1"), y: num(pointer, "y1") }, { x: CENTRE, y: CENTRE });
      closeToPoint({ x: num(pointer, "x2"), y: num(pointer, "y2") }, pointerEnd);
    }
  });

  test("an unrecognised setting falls back to the first position", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: false },
    ]);
    const fallback = renderToStaticMarkup(IronDial({ setting: "missing", settings }));
    const first = renderToStaticMarkup(IronDial({ setting: "cool", settings }));

    expect(fallback).toBe(first);
  });

  test("draws no steam arc when nothing in the range steams", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: false },
    ]);
    const html = renderToStaticMarkup(IronDial({ setting: "cool", settings }));

    expect(html).not.toContain("var(--color-steam)");
    expect(parseTags(html, "path")).toHaveLength(1);
  });

  test("still draws a steam arc when the very first setting is the one that steams", () => {
    // steamFrom is 0 here, not just >0 — the boundary `findIndex` can return.
    const settings = ironSettings([
      { key: "cool", steam: true },
      { key: "warm", steam: false },
    ]);
    const html = renderToStaticMarkup(IronDial({ setting: "cool", settings }));

    expect(html).toContain("var(--color-steam)");
    expect(parseTags(html, "path")).toHaveLength(2);
  });

  test("draws a steam arc spanning the first through the last steaming setting", () => {
    const keys = ["cool", "warm", "med", "hot", "extra"];
    const steaming = new Set(["warm", "hot"]);
    const settings = ironSettings(keys.map((key) => ({ key, steam: steaming.has(key) })));
    const html = renderToStaticMarkup(IronDial({ setting: "warm", settings }));

    const paths = parseTags(html, "path");
    expect(paths).toHaveLength(2); // ring + steam arc
    const steamPath = paths[1];
    expect(steamPath?.stroke).toBe("var(--color-steam)");
    expect(steamPath?.["stroke-width"]).toBe("3");
    expect(steamPath?.d).toBe(
      refArc(CENTRE, CENTRE, OUTER, angleOf(1, keys.length), angleOf(3, keys.length)),
    );
  });

  test("a single steaming setting draws a steam arc from that setting to itself", () => {
    const keys = ["cool", "warm", "hot"];
    const settings = ironSettings(keys.map((key) => ({ key, steam: key === "warm" })));
    const html = renderToStaticMarkup(IronDial({ setting: "warm", settings }));

    const paths = parseTags(html, "path");
    expect(paths).toHaveLength(2);
    expect(paths[1]?.d).toBe(
      refArc(CENTRE, CENTRE, OUTER, angleOf(1, keys.length), angleOf(1, keys.length)),
    );
  });

  test("off renders a crossed-out ring instead of a pointer, and skips the steam arc", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: true },
    ]);
    const html = renderToStaticMarkup(IronDial({ setting: "warm", settings, off: true }));

    expect(html).not.toContain("var(--color-steam)");
    const paths = parseTags(html, "path");
    expect(paths).toHaveLength(1); // ring only, steam arc skipped entirely when off

    const lines = parseTags(html, "line");
    expect(lines).toHaveLength(2 + 1); // 2 ticks + the cross's own line, no pointer
    const cross = lines[2];
    expect(cross).toBeDefined();
    if (!cross) return;
    const from = refPolar(CENTRE, CENTRE, OUTER - 6, 225);
    const to = refPolar(CENTRE, CENTRE, OUTER - 6, 45);
    closeToPoint({ x: num(cross, "x1"), y: num(cross, "y1") }, from);
    closeToPoint({ x: num(cross, "x2"), y: num(cross, "y2") }, to);
    expect(cross.stroke).toBe("var(--color-no)");
    expect(cross["stroke-width"]).toBe("1.6");

    const circles = parseTags(html, "circle");
    expect(circles).toHaveLength(2); // knob + the crossed-out ring
    const ring = circles[1];
    expect(ring).toBeDefined();
    if (!ring) return;
    expect(num(ring, "r")).toBeCloseTo(OUTER - 6);
    expect(ring.stroke).toBe("var(--color-no)");
    expect(ring["stroke-width"]).toBe("1.6");
    expect(ring.fill).toBe("none");
  });

  test("off draws every tick in the hairline colour, none selected", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: false },
    ]);
    const html = renderToStaticMarkup(IronDial({ setting: "warm", settings, off: true }));

    // The last line is the crossed-out ring's own cross-mark, not a tick.
    const ticks = parseTags(html, "line").slice(0, settings.length);
    for (const tick of ticks) {
      expect(tick.stroke).toBe("var(--color-hairline)");
    }
  });

  test("the knob face and radius switch between the on and off fills", () => {
    const settings = ironSettings([{ key: "cool", steam: false }]);
    const on = renderToStaticMarkup(IronDial({ setting: "cool", settings, off: false }));
    const off = renderToStaticMarkup(IronDial({ setting: "cool", settings, off: true }));

    const [onKnob] = parseTags(on, "circle");
    const [offKnob] = parseTags(off, "circle");
    expect(onKnob).toBeDefined();
    expect(offKnob).toBeDefined();
    if (!onKnob || !offKnob) return;

    expect(onKnob.fill).toBe("var(--color-knob)");
    expect(offKnob.fill).toBe("var(--color-panel)");
    expect(num(onKnob, "r")).toBeCloseTo(KNOB);
    expect(num(offKnob, "r")).toBeCloseTo(KNOB);
    expect(num(onKnob, "cx")).toBeCloseTo(CENTRE);
    expect(num(onKnob, "cy")).toBeCloseTo(CENTRE);
  });
});
