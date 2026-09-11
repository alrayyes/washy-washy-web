import { describe, expect, test } from "bun:test";
import ar from "../data/washy-washy.ar.json.dist?raw";
import de from "../data/washy-washy.de.json.dist?raw";
import es from "../data/washy-washy.es.json.dist?raw";
import fr from "../data/washy-washy.fr.json.dist?raw";
import ja from "../data/washy-washy.ja.json.dist?raw";
import jive from "../data/washy-washy.jive.json.dist?raw";
import en from "../data/washy-washy.json.dist?raw";
import linkedin from "../data/washy-washy.linkedin.json.dist?raw";
import ru from "../data/washy-washy.ru.json.dist?raw";
import tr from "../data/washy-washy.tr.json.dist?raw";
import zh from "../data/washy-washy.zh.json.dist?raw";
import { configSourceFor } from "../src/i18n/configSource";

describe("configSourceFor", () => {
  test("returns the matching locale's own bundled source, not a shared fallback", () => {
    expect(configSourceFor("en")).toBe(en);
    expect(configSourceFor("ja")).toBe(ja);
    expect(configSourceFor("de")).toBe(de);
    expect(configSourceFor("es")).toBe(es);
    expect(configSourceFor("fr")).toBe(fr);
    expect(configSourceFor("ar")).toBe(ar);
    expect(configSourceFor("zh")).toBe(zh);
    expect(configSourceFor("tr")).toBe(tr);
    expect(configSourceFor("ru")).toBe(ru);
    expect(configSourceFor("jive")).toBe(jive);
    expect(configSourceFor("linkedin")).toBe(linkedin);
  });

  test("every locale's source is real, non-empty JSON, and distinct from at least one other locale", () => {
    const sources = [en, ja, de, es, fr, ar, zh, tr, ru, jive, linkedin];
    for (const source of sources) {
      expect(source.length).toBeGreaterThan(0);
      expect(() => JSON.parse(source)).not.toThrow();
    }
    // Not every locale's translated content has to differ from every
    // other, but they can't all be the exact same file either — that
    // would mean the per-locale wiring collapsed to one shared source.
    expect(new Set(sources).size).toBeGreaterThan(1);
  });
});
