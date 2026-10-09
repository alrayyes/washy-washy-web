/**
 * Category-score gates, not the `lighthouse:recommended` preset's few
 * hundred per-audit assertions — those fire on things unrelated to what
 * this site actually needs (PWA install prompts, HTTP/2 push, service
 * workers) and turn red for reasons nobody here would act on. Performance
 * is a warning, not a hard gate: a CI runner's CPU is not Cloudflare's edge,
 * and a slower runner one day shouldn't block a merge over noise. The other
 * three are deterministic properties of the markup and config, unaffected
 * by runner speed, so they gate for real.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "bun run build && bunx wrangler dev --port 4321 --ip 127.0.0.1",
      startServerReadyPattern: "Ready on",
      startServerReadyTimeout: 60_000,
      url: [
        "http://localhost:4321/",
        "http://localhost:4321/config/",
        "http://localhost:4321/config/machine/",
        "http://localhost:4321/docs/",
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        // Lighthouse 13 insights, graded against wrangler dev, which applies
        // public/_headers and compresses the way Cloudflare's edge does.
        "cache-insight": "error",
        "document-latency-insight": "error",
        "render-blocking-insight": "error",
        // Warn only: Lighthouse fails this insight for any critical chain of
        // two requests, so HTML plus one module script already trips it and a
        // page with any JavaScript cannot pass. Watch the report instead.
        "network-dependency-tree-insight": "warn",
        "unused-javascript": "warn",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
