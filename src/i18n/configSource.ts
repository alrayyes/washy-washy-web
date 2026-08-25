import ar from "../../data/washy-washy.ar.json.dist?raw";
import de from "../../data/washy-washy.de.json.dist?raw";
import es from "../../data/washy-washy.es.json.dist?raw";
import fr from "../../data/washy-washy.fr.json.dist?raw";
import ja from "../../data/washy-washy.ja.json.dist?raw";
import jive from "../../data/washy-washy.jive.json.dist?raw";
import en from "../../data/washy-washy.json.dist?raw";
import linkedin from "../../data/washy-washy.linkedin.json.dist?raw";
import tr from "../../data/washy-washy.tr.json.dist?raw";
import zh from "../../data/washy-washy.zh.json.dist?raw";
import type { Locale } from "./locales";

const SOURCES: Record<Locale, string> = { en, ja, de, es, fr, ar, zh, tr, jive, linkedin };

/**
 * The bundled example chart/machine, translated per locale (#144 follow-up)
 * — the demo data a first-time visitor sees, not just the chrome around it.
 * Static imports (not a runtime locale->path lookup) because Vite's `?raw`
 * needs a literal specifier to resolve at build time.
 */
export function configSourceFor(locale: Locale): string {
  return SOURCES[locale];
}
