/**
 * Duck-typed rather than `instanceof HTMLElement` — Bun's test runtime has
 * no DOM globals at all (`tsconfig.test.json`'s deliberate no-DOM `lib`),
 * so this needs to work against a plain object in a unit test the same way
 * it works against a real `EventTarget` in the browser (#133).
 */
export interface TargetLike {
  tagName?: string;
  isContentEditable?: boolean;
}

/**
 * True when `target` is (or is inside) something a visitor could be
 * typing into — the one check every binding below has to pass before
 * doing anything, so `j`/`k`/`g`/`/`/`?` never get hijacked from someone
 * actually typing those characters into a field.
 */
export function isTypingTarget(target: TargetLike | null | undefined): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";
}

/** How long a second `g` press still counts as completing `gg`, not starting a fresh pair. */
export const DOUBLE_G_THRESHOLD_MS = 500;

/**
 * `gg` is two separate keydown events, not one — this is what tells the
 * second one from the first: `lastGPressAt` is `0` before any `g` has been
 * pressed (or after a completed `gg`/timeout resets it), so a `g` with
 * nothing recent behind it never reads as a pair.
 */
export function isSecondGPress(
  now: number,
  lastGPressAt: number,
  thresholdMs: number = DOUBLE_G_THRESHOLD_MS,
): boolean {
  return lastGPressAt > 0 && now - lastGPressAt <= thresholdMs;
}

/** Single source of truth for both the handler's `switch` and the help overlay's own listing. */
export interface KeyBinding {
  keys: string;
  description: string;
}

export const KEY_BINDINGS: KeyBinding[] = [
  { keys: "j", description: "Scroll down" },
  { keys: "k", description: "Scroll up" },
  { keys: "g g", description: "Jump to the top" },
  { keys: "G", description: "Jump to the bottom" },
  { keys: "/", description: "Focus the page's search field" },
  { keys: "?", description: "Toggle this help" },
  { keys: "Esc", description: "Close this help" },
];
