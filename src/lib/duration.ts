const DURATION_PATTERN = /^\d+:[0-5]\d$/;

/**
 * Validates a duration's `H:MM` shape — the `~` prefix isn't this
 * function's concern, callers strip it first (`DurationField` in
 * ConfigViewer.tsx). Empty is valid: "no duration set" (#40).
 */
export function isValidDuration(value: string): boolean {
  return value === "" || DURATION_PATTERN.test(value);
}
