---
title: Architecture
description: The static-site shape, where React islands sit inside it, and how the two Starlight surfaces coexist in one Astro project.
---

Washy washy web is a static [Astro](https://astro.build/) site (`output:
"static"`), deployed to Cloudflare Workers as static assets — `wrangler.jsonc`
declares no Worker script and no server-side code at all. Everything that
looks like app state — the active chart, the machine description, every
filter — lives in the visitor's own `localStorage` (or the URL, for
shareable filter/config state) and never reaches a server. There's nothing
to deploy beyond the built `dist/` directory, and nothing to run beyond a
static file server.

## Pages, islands and plain HTML

`src/pages/*.astro` are the app's own pages (the front page, `/config`,
`/config/machine`, `/privacy`, `/disclaimer`). Most of what's on them is
plain server-rendered HTML — the header, the footer, page chrome — with the
genuinely interactive parts mounted as React islands (`client:load`):
`SheetViewer`, `ConfigViewer`, `MachineEditor`, `HeaderUpload`, `ThemeToggle`,
`KeyboardNav`. An island hydrates independently of the rest of the page, and
each one that has meaningful client-side state to restore (from
`localStorage` or the URL) sets `data-hydrated="true"` once that's done — see
[Island hydration](/dev-docs/hydration/) for why that convention exists and
what depends on it.

`src/lib/` holds the plain-function logic behind those islands —
`filter.ts`'s facet computation, `configShare.ts`'s hash encode/decode,
`storage.ts`'s `localStorage` read/write, and so on — kept separate from the
components so it's unit-testable without a browser (`test/*.test.ts`, `bun
test`, no DOM). `src/hooks/` holds shared React hooks where more than one
component would otherwise duplicate the same `useEffect` — currently just
`useKeyboardNav`, which `KeyboardNav.tsx` wires into visible UI.

## Two Starlight surfaces, one Astro project

Both `/docs` (end-user) and `/dev-docs` (this site) are
[Starlight](https://starlight.astro.build/), configured once in
`astro.config.mjs` — Astro only supports a single `starlight()` integration
per project, so this isn't two separate Starlight instances, it's one
instance with content under two top-level directories:
`src/content/docs/docs/*` → `/docs/...`, `src/content/docs/dev-docs/*` →
`/dev-docs/...` (both one level deeper than Starlight's own default
`src/content/docs/*`, specifically so neither owns the site root).

They share the same chrome, deliberately: `src/components/starlight/*.astro`
overrides Starlight's default header, page frame and theme handling with
this site's own (`SiteHeader`, `SiteFooter`, the site's own theme toggle) —
originally built for `/docs` alone, so a visitor there sees the same site
they were just using rather than a bolted-on docs tool, and left
unconditional for `/dev-docs` too rather than branching per path. The
alternative (Starlight's own stock chrome for `/dev-docs`, for its search
box) would have meant two independent theme systems on the same site again —
exactly what those overrides exist to prevent. See the comments in
`src/components/starlight/ThemeProvider.astro` and `ThemeSelect.astro` for
the specifics, and issue #114 for the original full-parity decision.

## Everything else client-side

`@washy-washy/pdf` (the PDF rendering both this app and the CLI share) is
dynamically imported only when a download button is actually clicked
(`SheetViewer.tsx`'s `handleDownloadPhone`/`handleDownloadPrint`/
`handleDownloadCard`) — filtering the chart never pulls in `@react-pdf/
renderer` or `pdf-lib`, both sizeable, for a render nobody asked for yet.
