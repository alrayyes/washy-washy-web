/**
 * Optional, opt-in Umami analytics — off by default, and off in any build
 * that doesn't explicitly configure both env vars (local dev, a PR
 * preview, a fork). Works with either a self-hosted Umami instance or
 * Umami Cloud: nothing here assumes one over the other, an operator just
 * points `PUBLIC_UMAMI_SCRIPT_URL` at whichever host they run (#134).
 *
 * Astro's static build has no server runtime — this has to be a
 * build-time toggle (`import.meta.env`/`process.env`, read once, baked
 * into the static HTML output), not something checked per request.
 * Called from two different contexts that can't share one `import`:
 * `Layout.astro`'s frontmatter (Vite-processed, `import.meta.env`) and
 * `astro.config.mjs` (plain Node, `process.env`, since Vite's own module
 * graph doesn't exist yet when the config file itself runs) — this
 * function takes whichever env object its caller already has, rather
 * than reading either directly, so the actual account-both-hosts logic
 * lives in exactly one place regardless.
 */
export interface UmamiConfig {
  scriptUrl: string;
  websiteId: string;
}

export function readUmamiConfig(env: Record<string, string | undefined>): UmamiConfig | null {
  const scriptUrl = env.PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = env.PUBLIC_UMAMI_WEBSITE_ID;
  if (!scriptUrl || !websiteId) return null;
  return { scriptUrl, websiteId };
}
