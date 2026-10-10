/**
 * Captures one light and one dark screenshot of each page in
 * `readme-shots.ts` into `screenshots/`, for the release job to attach to the
 * GitHub release. The README links them at `releases/latest/download/`, so
 * nothing is committed and the images follow each release.
 *
 * Run by semantic-release's prepare step (`.releaserc.json`), so it only
 * costs anything when a release is actually being cut. By hand:
 * `bun run readme:shots`.
 */
import { mkdir } from "node:fs/promises";
import { type Browser, chromium } from "@playwright/test";
import { BASE_URL, waitForHydration, withBuiltSite } from "./capture-support";
import { COLOR_SCHEMES, README_PAGES, shotFile } from "./readme-shots";

const OUT_DIR = new URL("../screenshots/", import.meta.url);
const VIEWPORT = { width: 1280, height: 800 };

async function shoot(browser: Browser, page: (typeof README_PAGES)[number]) {
  for (const colorScheme of COLOR_SCHEMES) {
    const tab = await browser.newPage({ viewport: VIEWPORT, colorScheme });
    await tab.goto(`${BASE_URL}${page.route}`);
    if (page.hydrated) await waitForHydration(tab);
    await tab.waitForLoadState("networkidle");
    await tab.screenshot({ path: new URL(shotFile(page, colorScheme), OUT_DIR).pathname });
    await tab.close();
  }
}

await mkdir(OUT_DIR, { recursive: true });
await withBuiltSite(async () => {
  const browser = await chromium.launch();
  try {
    for (const page of README_PAGES) await shoot(browser, page);
  } finally {
    await browser.close();
  }
});
console.log(
  `Wrote ${README_PAGES.length * COLOR_SCHEMES.length} screenshots to ${OUT_DIR.pathname}`,
);
