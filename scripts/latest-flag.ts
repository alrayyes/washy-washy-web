/**
 * Whether publishing a release should make it `releases/latest`: only when no
 * newer version is already published, so re-running an old release's `publish`
 * job can't move latest back. Reads the published tags on stdin, one per line:
 * `gh release list --exclude-drafts --json tagName --jq '.[].tagName' | bun
 * scripts/latest-flag.ts v1.2.3`.
 */
export function latestFlag(tag: string, published: string[]): "--latest" | "--latest=false" {
  const newer = published.some((other) => Bun.semver.order(other.slice(1), tag.slice(1)) > 0);

  return newer ? "--latest=false" : "--latest";
}

if (import.meta.main) {
  const published = (await Bun.stdin.text()).split("\n").filter(Boolean);

  console.log(latestFlag(process.argv[2] ?? "", published));
}
