/**
 * release-please writes CHANGELOG.md newest-first, so its top version
 * heading is the build-time answer to "what version is this".
 */
const VERSION_HEADING = /^## \[(\d+\.\d+\.\d+)\]/m;

export function latestVersion(changelog: string): string | null {
  return changelog.match(VERSION_HEADING)?.[1] ?? null;
}
