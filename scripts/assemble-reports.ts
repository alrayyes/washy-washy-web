// Gathers the reports CI produced into the directory the site serves at
// apis.ryankes.eu/washy-washy-web/reports/. Run it as
// `bun scripts/assemble-reports.ts <in-dir> <out-dir>` from the repo root,
// after the jobs have uploaded their reports and the reports job has
// downloaded them under <in-dir>:
//
//   <in-dir>/test-reports/junit.xml, coverage/{lcov.info,coverage.xml,html/}
//   <in-dir>/e2e-reports/junit-e2e.xml
//   <in-dir>/lighthouse-reports/manifest.json and the files it names
//
// COMMIT and BUILD_DATE come from the environment so the index says which
// commit it describes.
//
// It refuses to run when an input is missing: a half-populated reports
// directory would deploy, replace the last good one, and 404 the links the
// catalogue points at.
import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

export interface IndexLink {
  label: string;
  href: string;
}

interface ManifestEntry {
  url: string;
  isRepresentativeRun?: boolean;
  htmlPath: string;
  jsonPath: string;
}

const REQUIRED = [
  "test-reports/junit.xml",
  "test-reports/coverage/lcov.info",
  "test-reports/coverage/coverage.xml",
  "test-reports/coverage/html/index.html",
  "e2e-reports/junit-e2e.xml",
  "lighthouse-reports/manifest.json",
];

const escapeHtml = (text: string) => Bun.escapeHTML(text);

// GitHub Pages has no directory listing, so every directory a link points at
// needs a page of its own. No colours of its own: `color-scheme` lets the
// browser's default link and background colours follow light and dark mode.
export function renderIndex(title: string, links: IndexLink[], note?: string): string {
  const items = links
    .map(
      ({ label, href }) => `      <li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`,
    )
    .join("\n");
  const noteHtml = note === undefined ? "" : `\n      <p>${escapeHtml(note)}</p>`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light dark; }
      body { font: 1rem/1.5 system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
      li { margin: 0.5rem 0; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>${noteHtml}
      <ul>
${items}
      </ul>
    </main>
  </body>
</html>
`;
}

// "http://localhost:4321/config/machine/" -> "config-machine", the site root -> "home".
export function slugForUrl(url: string): string {
  const slug = new URL(url).pathname
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9-]/g, "-");
  return slug === "" ? "home" : slug;
}

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

// Lighthouse CI writes every run (three per URL here). One pair per URL is
// what the layout asks for, so keep the run it marked representative: the
// median by performance score.
async function copyLighthouse(dir: string, out: string): Promise<IndexLink[]> {
  const manifest = JSON.parse(
    await readFile(join(dir, "manifest.json"), "utf8"),
  ) as ManifestEntry[];
  const representative = manifest.filter((entry) => entry.isRepresentativeRun);
  if (representative.length === 0) {
    throw new Error("missing report input: a representative Lighthouse run");
  }
  await mkdir(out, { recursive: true });
  const links: IndexLink[] = [];
  for (const entry of representative) {
    const slug = slugForUrl(entry.url);
    // The manifest holds the runner's absolute paths; the files are beside it.
    await cp(join(dir, basename(entry.htmlPath)), join(out, `${slug}.html`));
    await cp(join(dir, basename(entry.jsonPath)), join(out, `${slug}.json`));
    const path = new URL(entry.url).pathname;
    links.push({ label: `${path} (HTML)`, href: `${slug}.html` });
    links.push({ label: `${path} (JSON)`, href: `${slug}.json` });
  }
  await writeFile(
    join(out, "index.html"),
    renderIndex("Lighthouse reports", links, "The median of three runs for each page."),
  );
  return links;
}

export async function assembleReports({
  root,
  out,
  commit,
  date,
}: {
  root: string;
  out: string;
  commit: string;
  date: string;
}) {
  for (const path of REQUIRED) {
    if (!(await exists(join(root, path)))) {
      throw new Error(`missing report input: ${path}`);
    }
  }

  await mkdir(join(out, "tests"), { recursive: true });
  await cp(join(root, "test-reports/junit.xml"), join(out, "tests/unit.xml"));
  await cp(join(root, "e2e-reports/junit-e2e.xml"), join(out, "tests/e2e.xml"));
  await writeFile(
    join(out, "tests/index.html"),
    renderIndex("Test results", [
      { label: "Unit tests (JUnit XML)", href: "unit.xml" },
      { label: "End-to-end tests (JUnit XML)", href: "e2e.xml" },
    ]),
  );

  const coverage = join(root, "test-reports/coverage");
  await cp(join(coverage, "html"), join(out, "coverage"), { recursive: true });
  await cp(join(coverage, "lcov.info"), join(out, "coverage/lcov.info"));
  await cp(join(coverage, "coverage.xml"), join(out, "coverage/coverage.xml"));

  await copyLighthouse(join(root, "lighthouse-reports"), join(out, "lighthouse"));

  await writeFile(
    join(out, "index.html"),
    renderIndex(
      "washy-washy-web reports",
      [
        { label: "Tests", href: "tests/" },
        { label: "Unit tests (JUnit XML)", href: "tests/unit.xml" },
        { label: "End-to-end tests (JUnit XML)", href: "tests/e2e.xml" },
        { label: "Coverage (HTML)", href: "coverage/" },
        { label: "Coverage (Cobertura XML)", href: "coverage/coverage.xml" },
        { label: "Coverage (lcov)", href: "coverage/lcov.info" },
        { label: "Lighthouse", href: "lighthouse/" },
      ],
      `Commit ${commit}, built ${date}.`,
    ),
  );
}

if (import.meta.main) {
  const [root, out] = process.argv.slice(2);
  if (!root || !out) {
    console.error("usage: bun scripts/assemble-reports.ts <in-dir> <out-dir>");
    process.exit(2);
  }
  await assembleReports({
    root,
    out,
    commit: process.env.COMMIT ?? "unknown",
    date: process.env.BUILD_DATE ?? new Date().toISOString(),
  });
}
