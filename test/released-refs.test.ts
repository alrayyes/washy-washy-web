import { describe, expect, test } from "bun:test";
import { releasedRefs } from "../scripts/released-refs";

const REPO = "alrayyes/washy-washy-web";
const url = (path: string) => `https://github.com/${REPO}/${path}`;

describe("releasedRefs", () => {
  test("finds each issue and pull request the notes link, once, in order", () => {
    const notes = [
      `* clear advisories ([#464](${url("issues/464")})) ([eb2af05](${url("commit/eb2af05")})), closes [#463](${url("issues/463")})`,
      `* another ([#12](${url("pull/12")})), closes [#463](${url("issues/463")})`,
    ].join("\n");

    expect(releasedRefs(notes, REPO)).toEqual([12, 463, 464]);
  });

  test("ignores links into other repositories", () => {
    expect(releasedRefs("[#9](https://github.com/withastro/astro/issues/9)", REPO)).toEqual([]);
  });
});
