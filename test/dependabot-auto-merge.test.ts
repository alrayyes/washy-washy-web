import { describe, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface Step {
  name?: string;
  run?: string;
  env?: Record<string, string>;
}

const workflow = Bun.YAML.parse(
  readFileSync(".github/workflows/dependabot-auto-merge.yml", "utf8"),
) as { jobs: Record<string, { steps: Step[] }> };

const step = Object.values(workflow.jobs)
  .flatMap((job) => job.steps)
  .find(({ name }) => name === "Wave it through once the checks are green");

/** Runs the step with a fake `gh` and returns the `--subject` it was given. */
function subjectFor(title: string, number: string): string {
  const bin = mkdtempSync(join(tmpdir(), "fake-gh-"));
  const gh = join(bin, "gh");
  writeFileSync(
    gh,
    '#!/bin/sh\nwhile [ $# -gt 0 ] && [ "$1" != --subject ]; do shift; done\nprintf %s "$2"\n',
  );
  chmodSync(gh, 0o755);

  const result = Bun.spawnSync(["bash", "-eo", "pipefail", "-c", step?.run ?? "false"], {
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      PR_TITLE: title,
      PR_NUMBER: number,
      PR_URL: `https://github.com/o/r/pull/${number}`,
    },
  });
  rmSync(bin, { recursive: true });

  return result.stdout.toString();
}

describe("dependabot auto-merge subject", () => {
  // Without the number the release notes never link the pull request, and
  // released-refs has nothing to label.
  test("ends in the pull request number", () => {
    expect(subjectFor("fix(deps): Bump astro from 1.0.0 to 1.0.1", "479")).toBe(
      "fix(deps): bump astro from 1.0.0 to 1.0.1 (#479)",
    );
  });

  test("passes the number to the step", () => {
    expect(step?.env?.PR_NUMBER).toBe("${{ github.event.pull_request.number }}");
  });
});
