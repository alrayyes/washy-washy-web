/**
 * Captures the screenshots embedded in the /docs pages, one light and one
 * dark variant of each — /docs shares the site's own theme system (#114),
 * so a single light-only shot is wrong, not just stale, once a reader's in
 * dark mode. Not wired into CI — run it by hand (`bun run docs:media`)
 * after a UI change that makes one of the shots stale, and commit the
 * result the same way `og-image.png` and `favicon.svg` are hand-maintained
 * static assets rather than generated per build.
 *
 * Also captures one set per non-English locale (locales.ts's DOCS_LOCALES)
 * — #144's "screenshots should reflect the language" — under
 * public/docs/media/{locale}/, alongside the existing unprefixed English
 * set at public/docs/media/ (left exactly where the English docs already
 * reference them). jive's and linkedin's own docs (src/pages/jive/docs/,
 * src/pages/linkedin/docs/) reference public/docs/media/jive/ and
 * public/docs/media/linkedin/ the same way the other locales' Starlight
 * docs reference their own.
 *
 * Builds and serves via `scripts/serve-dist.ts`, the same static file server
 * `playwright.config.ts` uses for the e2e suite — `astro preview`/`astro
 * dev` both daemonize and exit immediately, which reads as a crash to
 * anything expecting a foreground server.
 */
import { mkdir } from "node:fs/promises";
import { type Browser, chromium, type Page } from "@playwright/test";
import { DOCS_LOCALES, type Locale, relativeLocaleUrl } from "../src/i18n/locales";
import { translator } from "../src/i18n/ui";

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
  /** Locale-unprefixed — resolved per locale via relativeLocaleUrl. */
  path: string;
  viewport: { width: number; height: number };
  file: string;
  /** `t` is this shot's locale's own translator, for locale-aware selectors (button/heading text). */
  act?: (page: Page, t: ReturnType<typeof translator>) => Promise<void>;
}

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

const SHOTS: Shot[] = [
  { path: "/", viewport: PHONE, file: "sheet-overview.png" },
  {
    path: "/",
    viewport: PHONE,
    file: "sheet-filters.png",
    act: async (page, t) => {
      await page.selectOption("#filter-cut", "wash");
      await page.locator("summary", { hasText: t("sheetViewer.advanced") }).click();
    },
  },
  {
    path: "/",
    viewport: PHONE,
    file: "sheet-pdf-download.png",
    act: async (page, t) => {
      const card = page.locator("article").first();
      await card
        .getByRole("button", { name: new RegExp(t("sheet.download")) })
        .scrollIntoViewIfNeeded();
    },
  },
  { path: "/config", viewport: DESKTOP, file: "config-chart-cards.png" },
  {
    path: "/config/machine",
    viewport: DESKTOP,
    file: "machine-editor.png",
    act: async (page, t) => {
      // exact: true — the page's own <h1> ("Washer & iron settings", #132)
      // contains "iron" too in some locales, and a substring match on the
      // heading text alone risks hitting both, ambiguously.
      await page
        .getByRole("heading", { name: t("common.iron"), exact: true })
        .scrollIntoViewIfNeeded();
    },
  },
];

const COLOR_SCHEMES = ["light", "dark"] as const;

async function shoot(
  browser: Browser,
  shot: Shot,
  colorScheme: (typeof COLOR_SCHEMES)[number],
  locale: Locale,
) {
  const page = await browser.newPage({ viewport: shot.viewport, colorScheme });
  const t = translator(locale);
  await page.goto(`${BASE_URL}${relativeLocaleUrl(locale, shot.path)}`);
  await waitForHydration(page);
  if (shot.act) await shot.act(page, t);
  const stem = shot.file.replace(/\.png$/, "");
  const dir = locale === "en" ? MEDIA_DIR : new URL(`${locale}/`, MEDIA_DIR);
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: new URL(`${stem}-${colorScheme}.png`, dir).pathname });
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
      const locales: Locale[] = ["en", ...DOCS_LOCALES.filter((locale) => locale !== "en")];
      for (const locale of locales) {
        for (const shot of SHOTS) {
          for (const colorScheme of COLOR_SCHEMES) {
            await shoot(browser, shot, colorScheme, locale);
          }
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
