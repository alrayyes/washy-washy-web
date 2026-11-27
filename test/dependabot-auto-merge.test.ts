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

/** Runs the step with a fake `gh` and returns each call it made, one per line. */
function ghCalls(title: string, number: string, armed = false): string[] {
  const bin = mkdtempSync(join(tmpdir(), "fake-gh-"));
  const gh = join(bin, "gh");
  const log = join(bin, "calls");
  writeFileSync(
    gh,
    '#!/bin/sh\necho "$*" >> "$GH_LOG"\nif [ "$2" = view ]; then echo "$ARMED"; fi\n',
  );
  chmodSync(gh, 0o755);

  Bun.spawnSync(["bash", "-eo", "pipefail", "-c", step?.run ?? "false"], {
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      GH_LOG: log,
      ARMED: String(armed),
      PR_TITLE: title,
      PR_NUMBER: number,
      PR_URL: `https://github.com/o/r/pull/${number}`,
    },
  });
  const calls = readFileSync(log, "utf8").trim().split("\n");
  rmSync(bin, { recursive: true });

  return calls;
}

const TITLE = "fix(deps): Bump astro from 1.0.0 to 1.0.1";
const URL_479 = "https://github.com/o/r/pull/479";
const ARM = `pr merge --auto --squash --subject fix(deps): bump astro from 1.0.0 to 1.0.1 (#479) ${URL_479}`;
const LOOK = `pr view ${URL_479} --json autoMergeRequest --jq .autoMergeRequest != null`;

describe("dependabot auto-merge subject", () => {
  // Without the number the release notes never link the pull request, and
  // released-refs has nothing to label.
  test("arms with a subject ending in the pull request number", () => {
    expect(ghCalls(TITLE, "479")).toEqual([LOOK, ARM]);
  });

  // Arming an armed pull request keeps the old subject (#484).
  test("disarms first when already armed, so a new title replaces the old", () => {
    expect(ghCalls(TITLE, "479", true)).toEqual([LOOK, `pr merge --disable-auto ${URL_479}`, ARM]);
  });

  test("passes the number to the step", () => {
    expect(step?.env?.PR_NUMBER).toBe("${{ github.event.pull_request.number }}");
  });
});
