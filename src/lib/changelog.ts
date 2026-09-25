/**
 * semantic-release (.releaserc.json) writes CHANGELOG.md newest-first and
 * never bumps package.json's own version (no @semantic-release/npm
 * plugin), so the changelog's top heading is the only build-time source of
 * truth for "what version is this".
 */
const VERSION_HEADING = /^## \[(\d+\.\d+\.\d+)\]/m;

export function latestVersion(changelog: string): string | null {
  return changelog.match(VERSION_HEADING)?.[1] ?? null;
}
