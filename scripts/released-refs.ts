/**
 * The issues and pull requests a release's notes link to, so the release job
 * can label them `released`. Reads the notes on stdin and prints one number
 * per line: `gh release view v1.2.3 --json body --jq .body | bun
 * scripts/released-refs.ts owner/repo`.
 */
export function releasedRefs(notes: string, repo: string): number[] {
  const link = new RegExp(`https://github\\.com/${repo}/(?:issues|pull)/(\\d+)`, "g");
  const numbers = [...notes.matchAll(link)].map((match) => Number(match[1]));

  return [...new Set(numbers)].sort((a, b) => a - b);
}

if (import.meta.main) {
  const refs = releasedRefs(await Bun.stdin.text(), process.argv[2] ?? "");

  for (const ref of refs) console.log(ref);
}
