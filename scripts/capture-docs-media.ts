/**
 * Captures the screenshots embedded in the /docs pages, one light and one
 * dark variant of each — /docs shares the site's own theme system (#114),
 * so a single light-only shot is wrong, not just stale, once a reader's in
 * dark mode. Not wired into CI — run it by hand (`bun run docs:media`)
 * after a UI change that makes one of the shots stale, and commit the
 * result the same way `og-image.png` and `favicon.svg` are hand-maintained
 * static assets rather than generated per build.
 *
 * Builds and serves via `scripts/serve-dist.ts`, the same static file server
 * `playwright.config.ts` uses for the e2e suite — `astro preview`/`astro
 * dev` both daemonize and exit immediately, which reads as a crash to
 * anything expecting a foreground server.
 */
import { mkdir } from "node:fs/promises";
import { type Browser, chromium, type Page } from "@playwright/test";

const DIST = new URL("../dist/", import.meta.url);
const MEDIA_DIR = new URL("../public/docs/media/", import.meta.url);
const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

async function waitForServer(url: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not up yet — keep polling.
    }
    await Bun.sleep(200);
  }
  throw new Error(`Server at ${url} did not come up within ${timeoutMs}ms`);
}

/** React islands (`client:load`) hydrate after first paint — this flag is the e2e suite's own signal that listeners are attached. */
async function waitForHydration(page: Page) {
  await page.waitForSelector('[data-hydrated="true"]');
}

interface Shot {
  path: string;
  viewport: { width: number; height: number };
  file: string;
  act?: (page: Page) => Promise<void>;
}

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

const SHOTS: Shot[] = [
  { path: "/", viewport: PHONE, file: "sheet-overview.png" },
  {
    path: "/",
    viewport: PHONE,
    file: "sheet-filters.png",
    act: async (page) => {
      await page.selectOption("#filter-cut", "wash");
      await page.locator("summary", { hasText: "Advanced" }).click();
    },
  },
  {
    path: "/",
    viewport: PHONE,
    file: "sheet-pdf-download.png",
    act: async (page) => {
      const card = page.locator("article").first();
      await card.getByRole("button", { name: /Download/ }).scrollIntoViewIfNeeded();
    },
  },
  { path: "/config", viewport: DESKTOP, file: "config-chart-cards.png" },
  {
    path: "/config/machine",
    viewport: DESKTOP,
    file: "machine-editor.png",
    act: async (page) => {
      await page.getByRole("heading", { name: "Iron" }).scrollIntoViewIfNeeded();
    },
  },
];

const COLOR_SCHEMES = ["light", "dark"] as const;

async function shoot(browser: Browser, shot: Shot, colorScheme: (typeof COLOR_SCHEMES)[number]) {
  const page = await browser.newPage({ viewport: shot.viewport, colorScheme });
  await page.goto(`${BASE_URL}${shot.path}`);
  await waitForHydration(page);
  if (shot.act) await shot.act(page);
  const stem = shot.file.replace(/\.png$/, "");
  await page.screenshot({ path: new URL(`${stem}-${colorScheme}.png`, MEDIA_DIR).pathname });
  await page.close();
}

async function main() {
  await mkdir(MEDIA_DIR, { recursive: true });

  console.log("Building...");
  const build = Bun.spawnSync(["bun", "run", "build"], { stdout: "inherit", stderr: "inherit" });
  if (build.exitCode !== 0) throw new Error("astro build failed");

  console.log(`Serving ${DIST.pathname}...`);
  const server = Bun.spawn(["bun", "scripts/serve-dist.ts"], {
    stdout: "inherit",
    stderr: "inherit",
  });

  try {
    await waitForServer(BASE_URL);

    const browser = await chromium.launch();
    try {
      for (const shot of SHOTS) {
        for (const colorScheme of COLOR_SCHEMES) {
          await shoot(browser, shot, colorScheme);
        }
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
  }

  console.log(`Wrote screenshots to ${MEDIA_DIR.pathname}`);
}

await main();
