import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assembleReports, renderIndex, slugForUrl } from "../scripts/assemble-reports";

let root: string;
let out: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "reports-in-"));
  out = await mkdtemp(join(tmpdir(), "reports-out-"));
  await mkdir(join(root, "test-reports/coverage/html"), { recursive: true });
  await mkdir(join(root, "e2e-reports"), { recursive: true });
  await mkdir(join(root, "lighthouse-reports"), { recursive: true });
  await writeFile(join(root, "test-reports/junit.xml"), "<testsuites/>");
  await writeFile(join(root, "test-reports/coverage/lcov.info"), "TN:\nend_of_record\n");
  await writeFile(join(root, "test-reports/coverage/coverage.xml"), "<coverage/>");
  await writeFile(join(root, "test-reports/coverage/html/index.html"), "<html>cov</html>");
  await writeFile(join(root, "e2e-reports/junit-e2e.xml"), "<testsuites e2e/>");
  await writeFile(
    join(root, "lighthouse-reports/manifest.json"),
    JSON.stringify([
      {
        url: "http://localhost:4321/",
        isRepresentativeRun: false,
        htmlPath: "/home/runner/work/x/.lighthouseci/lhr-1.html",
        jsonPath: "/home/runner/work/x/.lighthouseci/lhr-1.json",
      },
      {
        url: "http://localhost:4321/",
        isRepresentativeRun: true,
        htmlPath: "/home/runner/work/x/.lighthouseci/lhr-2.html",
        jsonPath: "/home/runner/work/x/.lighthouseci/lhr-2.json",
      },
      {
        url: "http://localhost:4321/config/machine/",
        isRepresentativeRun: true,
        htmlPath: "/home/runner/work/x/.lighthouseci/lhr-3.html",
        jsonPath: "/home/runner/work/x/.lighthouseci/lhr-3.json",
      },
    ]),
  );
  for (const n of [1, 2, 3]) {
    await writeFile(join(root, `lighthouse-reports/lhr-${n}.html`), `<html>lh${n}</html>`);
    await writeFile(join(root, `lighthouse-reports/lhr-${n}.json`), `{"run":${n}}`);
  }
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
  await rm(out, { recursive: true, force: true });
});

const meta = { commit: "abc1234", date: "2026-10-09T10:00:00Z" };

describe("assembleReports", () => {
  test("lays the tests and coverage out as the site serves them", async () => {
    await assembleReports({ root, out, ...meta });
    expect(await readFile(join(out, "tests/unit.xml"), "utf8")).toBe("<testsuites/>");
    expect(await readFile(join(out, "tests/e2e.xml"), "utf8")).toBe("<testsuites e2e/>");
    expect(await readFile(join(out, "coverage/coverage.xml"), "utf8")).toBe("<coverage/>");
    expect(await readFile(join(out, "coverage/lcov.info"), "utf8")).toBe("TN:\nend_of_record\n");
    expect(await readFile(join(out, "coverage/index.html"), "utf8")).toBe("<html>cov</html>");
  });

  test("keeps one Lighthouse pair per page, from the representative run", async () => {
    await assembleReports({ root, out, ...meta });
    expect(await readFile(join(out, "lighthouse/home.html"), "utf8")).toBe("<html>lh2</html>");
    expect(await readFile(join(out, "lighthouse/home.json"), "utf8")).toBe('{"run":2}');
    expect(await readFile(join(out, "lighthouse/config-machine.html"), "utf8")).toBe(
      "<html>lh3</html>",
    );
    const page = await readFile(join(out, "lighthouse/index.html"), "utf8");
    expect(page).toContain('href="home.html"');
    expect(page).toContain('href="config-machine.json"');
    expect(page).not.toContain("lhr-1");
  });

  test("writes a tests page and a top-level index with the commit and date", async () => {
    await assembleReports({ root, out, ...meta });
    const tests = await readFile(join(out, "tests/index.html"), "utf8");
    expect(tests).toContain('href="unit.xml"');
    expect(tests).toContain('href="e2e.xml"');
    const index = await readFile(join(out, "index.html"), "utf8");
    expect(index).toContain('href="tests/"');
    expect(index).toContain('href="coverage/"');
    expect(index).toContain('href="coverage/coverage.xml"');
    expect(index).toContain('href="lighthouse/"');
    expect(index).toContain("abc1234");
    expect(index).toContain("2026-10-09T10:00:00Z");
  });

  test("refuses to run when an input is missing", async () => {
    await rm(join(root, "test-reports/coverage/coverage.xml"));
    await expect(assembleReports({ root, out, ...meta })).rejects.toThrow(
      "missing report input: test-reports/coverage/coverage.xml",
    );
  });

  test("refuses to run when the e2e results are missing", async () => {
    await rm(join(root, "e2e-reports/junit-e2e.xml"));
    await expect(assembleReports({ root, out, ...meta })).rejects.toThrow(
      "missing report input: e2e-reports/junit-e2e.xml",
    );
  });

  test("refuses to run when no Lighthouse run is representative", async () => {
    await writeFile(join(root, "lighthouse-reports/manifest.json"), "[]");
    await expect(assembleReports({ root, out, ...meta })).rejects.toThrow(
      "missing report input: a representative Lighthouse run",
    );
  });
});

describe("slugForUrl", () => {
  test("names a page after its path", () => {
    expect(slugForUrl("http://localhost:4321/")).toBe("home");
    expect(slugForUrl("http://localhost:4321/docs/")).toBe("docs");
    expect(slugForUrl("http://localhost:4321/config/machine/")).toBe("config-machine");
  });
});

describe("renderIndex", () => {
  test("escapes what it is given", () => {
    const html = renderIndex("a <b>", [{ label: "x & y", href: 'z"' }]);
    expect(html).toContain("a &lt;b&gt;");
    expect(html).toContain("x &amp; y");
    expect(html).toContain("z&quot;");
  });

  test("puts the note under the title when there is one", () => {
    expect(renderIndex("T", [], "built from abc")).toContain("<p>built from abc</p>");
    expect(renderIndex("T", [])).not.toContain("<p>");
  });
});
