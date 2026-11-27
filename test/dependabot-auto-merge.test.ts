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

/** Runs the step with a fake `gh`; returns its exit code and each call it made. */
function run({ armed = false, viewFails = false } = {}): { exit: number; calls: string[] } {
  const bin = mkdtempSync(join(tmpdir(), "fake-gh-"));
  const gh = join(bin, "gh");
  const log = join(bin, "calls");
  writeFileSync(
    gh,
    '#!/bin/sh\necho "$*" >> "$GH_LOG"\nif [ "$2" = view ]; then [ -z "$VIEW_FAILS" ] || exit 1; echo "$VIEW"; fi\n',
  );
  chmodSync(gh, 0o755);

  // `bash -e` is what Actions runs a step with.
  const result = Bun.spawnSync(["bash", "-e", "-c", step?.run ?? "false"], {
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      GH_LOG: log,
      VIEW: `${armed} fix(deps): Bump astro from 1.0.0 to 1.0.1`,
      VIEW_FAILS: viewFails ? "1" : "",
      PR_NUMBER: "479",
      PR_URL,
    },
  });
  const calls = readFileSync(log, "utf8").trim().split("\n");
  rmSync(bin, { recursive: true });

  return { exit: result.exitCode, calls };
}

const PR_URL = "https://github.com/o/r/pull/479";
const ARM = `pr merge --auto --squash --subject fix(deps): bump astro from 1.0.0 to 1.0.1 (#479) ${PR_URL}`;
// A merged pull request still reports its request, hence the state check.
const LOOK = `pr view ${PR_URL} --json title,state,autoMergeRequest --jq "\\(.state == "OPEN" and .autoMergeRequest != null) \\(.title)"`;

describe("dependabot auto-merge subject", () => {
  // Without the number the release notes never link the pull request, and
  // released-refs has nothing to label.
  test("arms with a subject ending in the pull request number", () => {
    expect(run()).toEqual({ exit: 0, calls: [LOOK, ARM] });
  });

  // Arming an armed pull request keeps the old subject (#484).
  test("disarms first when already armed, so a new title replaces the old", () => {
    const calls = [LOOK, `pr merge --disable-auto ${PR_URL}`, ARM];
    expect(run({ armed: true })).toEqual({ exit: 0, calls });
  });

  // Carrying on would arm over the old subject with the job still green.
  test("fails without arming when the pull request can't be read", () => {
    expect(run({ viewFails: true })).toEqual({ exit: 1, calls: [LOOK] });
  });

  test("passes the number to the step", () => {
    expect(step?.env?.PR_NUMBER).toBe("${{ github.event.pull_request.number }}");
  });
});
