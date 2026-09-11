// The `+` quantifiers here can never matter: by the time this runs, the
// previous `.replace()` below already collapsed every run of
// non-alphanumeric characters — dashes included — into exactly one dash,
// so the string can never contain two consecutive dashes anywhere,
// boundaries included. `^-+`/`^-` (and the trailing equivalents) match the
// exact same single dash either way. Confirmed equivalent by inspection.
// Stryker disable next-line Regex
const TRIM_DASHES = /^-+|-+$/g;

/** `White Towels` -> `white-towels`. */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(TRIM_DASHES, "");
}
