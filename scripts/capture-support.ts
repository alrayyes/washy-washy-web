/**
 * What the screenshot scripts share: build the site, serve `dist/` the way
 * the e2e suite does, and wait for it. `astro preview`/`astro dev` both
 * daemonize and exit immediately, which reads as a crash to anything
 * expecting a foreground server, so `scripts/serve-dist.ts` is used instead.
 */
import type { Page } from "@playwright/test";

export const PORT = 4321;
export const BASE_URL = `http://localhost:${PORT}`;

export async function waitForServer(url: string, timeoutMs = 15_000) {
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
export async function waitForHydration(page: Page) {
  await page.waitForSelector('[data-hydrated="true"]');
}

/** Runs `work` against a freshly built, served `dist/`, then stops the server. */
export async function withBuiltSite(work: () => Promise<void>) {
  console.log("Building...");
  const build = Bun.spawnSync(["bun", "run", "build"], { stdout: "inherit", stderr: "inherit" });
  if (build.exitCode !== 0) throw new Error("astro build failed");

  console.log("Serving dist/...");
  const server = Bun.spawn(["bun", "scripts/serve-dist.ts"], {
    stdout: "inherit",
    stderr: "inherit",
  });

  try {
    await waitForServer(BASE_URL);
    await work();
  } finally {
    server.kill();
  }
}
