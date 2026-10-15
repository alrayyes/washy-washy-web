import { describe, expect, test } from "bun:test";
import type { Machine } from "@washy-washy/core";
import { render } from "svelte/server";
import IronDial from "../src/components/IronDial.svelte";

function ironSettings(
  entries: Array<{ key: string; steam: boolean }>,
): Machine["iron"]["settings"] {
  return entries.map(({ key, steam }) => ({ key, dots: "", label: key, detail: "", steam }));
}

/**
 * A test-owned reimplementation of dialGeometry.ts's own `polar`/`arc`
 * functions — see program-dial-render.test.ts's copy of this comment for
 * why it's independent rather than imported.
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
 * attribute map.
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

/**
 * The segments of a `M x y L x y M x y L x y ...` path, as [x1, y1, x2, y2]
 * tuples. The unselected ticks share one path (#357), so the tests read the
 * geometry back out of its `d` attribute.
 */
function parseSegments(d: string): number[][] {
  return d
    .split("M")
    .filter((part) => part.trim() !== "")
    .map((part) => (part.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? []).map(Number));
}

function closeToPoint(actual: { x: number; y: number }, expected: { x: number; y: number }): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
}

function renderDial(props: {
  setting: string;
  settings: Machine["iron"]["settings"];
  off?: boolean;
  size?: number;
}): string {
  return render(IronDial, { props }).body;
}

describe("IronDial (Svelte)", () => {
  const CENTRE = 38; // size 76 / 2
  const OUTER = CENTRE - 3;
  const KNOB = OUTER * 0.42;
  const SWEEP = 280;
  const FIRST = -SWEEP / 2;

  function angleOf(position: number, positionsCount: number): number {
    const step = SWEEP / Math.max(1, positionsCount - 1);
    return (FIRST + position * step + 360) % 360;
  }

  test("draws the ring, one path for the unselected ticks, the selected tick, a knob and a pointer when not off", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: false },
      { key: "hot", steam: false },
    ]);
    const html = renderDial({ setting: "warm", settings });

    const paths = parseTags(html, "path"); // ring (no steam), then the unselected ticks
    expect(paths).toHaveLength(2);
    expect(parseSegments(paths[1]?.d ?? "")).toHaveLength(2);
    expect(parseTags(html, "line")).toHaveLength(1 + 1); // selected tick + pointer
    expect(parseTags(html, "circle")).toHaveLength(2); // knob + centre dot
  });

  test("defaults to a 76px square viewBox, honours an explicit size", () => {
    const settings = ironSettings([{ key: "cool", steam: false }]);
    const defaultHtml = renderDial({ setting: "cool", settings });
    expect(defaultHtml).toContain('width="76"');
    expect(defaultHtml).toContain('viewBox="0 0 76 76"');

    const sizedHtml = renderDial({ setting: "cool", settings, size: 50 });
    expect(sizedHtml).toContain('width="50"');
    expect(sizedHtml).toContain('viewBox="0 0 50 50"');
  });

  test("the ring always spans the same fixed 280 degree sweep, off or not", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "hot", steam: false },
    ]);
    const on = renderDial({ setting: "cool", settings });
    const off = renderDial({ setting: "cool", settings, off: true });

    const expected = refArc(CENTRE, CENTRE, OUTER, angleOf(0, 2), angleOf(0, 2) + SWEEP);
    expect(parseTags(on, "path")[0]?.d).toBe(expected);
    expect(parseTags(off, "path")[0]?.d).toBe(expected);
    expect(parseTags(on, "path")[0]?.stroke).toBe("var(--color-line)");
    expect(parseTags(off, "path")[0]?.stroke).toBe("var(--color-hairline)");
  });

  test("a single setting doesn't divide by zero and still draws one tick at the ring's start", () => {
    const settings = ironSettings([{ key: "only", steam: false }]);
    const html = renderDial({ setting: "only", settings });

    // The only tick is also the selected one, so there is no unselected path.
    expect(parseTags(html, "path")).toHaveLength(1);
    const [tick] = parseTags(html, "line");
    expect(tick).toBeDefined();
    if (!tick) return;
    // outer - 9 / outer + 1.5, at angleOf(0, 1).
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
    const html = renderDial({ setting: keys[selectedIndex] as string, settings });

    const [selectedTick, pointer] = parseTags(html, "line");
    const unselected = parseTags(html, "path")[1];
    const drawn = parseSegments(unselected?.d ?? "");
    expect(drawn).toHaveLength(keys.length - 1);
    expect(unselected?.stroke).toBe("var(--color-faint)");
    expect(unselected?.["stroke-width"]).toBe("0.7");
    expect(unselected?.fill).toBe("none");

    keys.forEach((_, position) => {
      const selected = position === selectedIndex;
      const angle = angleOf(position, keys.length);
      const inner = refPolar(CENTRE, CENTRE, OUTER - (selected ? 9 : 5), angle);
      const edge = refPolar(CENTRE, CENTRE, OUTER + (selected ? 1.5 : 0), angle);
      const tick = selected
        ? [
            num(selectedTick ?? {}, "x1"),
            num(selectedTick ?? {}, "y1"),
            num(selectedTick ?? {}, "x2"),
            num(selectedTick ?? {}, "y2"),
          ]
        : drawn.shift();
      expect(tick).toBeDefined();
      if (!tick) return;

      closeToPoint({ x: tick[0] as number, y: tick[1] as number }, inner);
      closeToPoint({ x: tick[2] as number, y: tick[3] as number }, edge);
    });
    expect(selectedTick?.stroke).toBe("var(--color-accent)");
    expect(selectedTick?.["stroke-width"]).toBe("2");

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
    const fallback = renderDial({ setting: "missing", settings });
    const first = renderDial({ setting: "cool", settings });

    expect(fallback).toBe(first);
  });

  test("draws no steam arc when nothing in the range steams", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: false },
    ]);
    const html = renderDial({ setting: "cool", settings });

    expect(html).not.toContain("var(--color-steam)");
    expect(parseTags(html, "path")).toHaveLength(2); // ring + unselected ticks
  });

  test("still draws a steam arc when the very first setting is the one that steams", () => {
    // steamFrom is 0 here, not just >0 — the boundary `findIndex` can return.
    const settings = ironSettings([
      { key: "cool", steam: true },
      { key: "warm", steam: false },
    ]);
    const html = renderDial({ setting: "cool", settings });

    expect(html).toContain("var(--color-steam)");
    expect(parseTags(html, "path")).toHaveLength(3); // ring + steam arc + ticks
  });

  test("draws a steam arc spanning the first through the last steaming setting", () => {
    const keys = ["cool", "warm", "med", "hot", "extra"];
    const steaming = new Set(["warm", "hot"]);
    const settings = ironSettings(keys.map((key) => ({ key, steam: steaming.has(key) })));
    const html = renderDial({ setting: "warm", settings });

    const paths = parseTags(html, "path");
    expect(paths).toHaveLength(3); // ring + steam arc + unselected ticks
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
    const html = renderDial({ setting: "warm", settings });

    const paths = parseTags(html, "path");
    expect(paths).toHaveLength(3); // ring + steam arc + unselected ticks
    expect(paths[1]?.d).toBe(
      refArc(CENTRE, CENTRE, OUTER, angleOf(1, keys.length), angleOf(1, keys.length)),
    );
  });

  test("off renders a crossed-out ring instead of a pointer, and skips the steam arc", () => {
    const settings = ironSettings([
      { key: "cool", steam: false },
      { key: "warm", steam: true },
    ]);
    const html = renderDial({ setting: "warm", settings, off: true });

    expect(html).not.toContain("var(--color-steam)");
    const paths = parseTags(html, "path");
    expect(paths).toHaveLength(2); // ring + all ticks; steam arc skipped entirely when off

    const lines = parseTags(html, "line");
    expect(lines).toHaveLength(1); // only the cross's own line: no selected tick, no pointer
    const cross = lines[0];
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
    const html = renderDial({ setting: "warm", settings, off: true });

    const ticks = parseTags(html, "path")[1];
    expect(parseSegments(ticks?.d ?? "")).toHaveLength(settings.length);
    expect(ticks?.stroke).toBe("var(--color-hairline)");
  });

  test("the knob face and radius switch between the on and off fills", () => {
    const settings = ironSettings([{ key: "cool", steam: false }]);
    const on = renderDial({ setting: "cool", settings, off: false });
    const off = renderDial({ setting: "cool", settings, off: true });

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
