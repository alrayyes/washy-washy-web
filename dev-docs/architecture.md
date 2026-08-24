# Architecture

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
[Island hydration](hydration.md) for why that convention exists and what
depends on it.

`src/lib/` holds the plain-function logic behind those islands —
`filter.ts`'s facet computation, `configShare.ts`'s hash encode/decode,
`storage.ts`'s `localStorage` read/write, and so on — kept separate from the
components so it's unit-testable without a browser (`test/*.test.ts`, `bun
test`, no DOM). `src/hooks/` holds shared React hooks where more than one
component would otherwise duplicate the same `useEffect` — currently just
`useKeyboardNav`, which `KeyboardNav.tsx` wires into visible UI.

## One Starlight surface, one Astro project

`/docs` (`src/content/docs/docs/*`) is the only
[Starlight](https://starlight.astro.build/) content in this project — one
level deeper than Starlight's own default `src/content/docs/*`, specifically
so it doesn't own the site root. It's translated into five languages
(`src/i18n/locales.ts`'s `DOCS_LOCALES`, #144), so its own chrome and
sidebar carry per-locale `translations` (`astro.config.mjs`).

This document tree used to be a second Starlight surface at `/dev-docs`,
sharing that same instance (Astro only supports one `starlight()`
integration per project). It moved back out to plain repo markdown once
`/docs` picked up full translation coverage — an untranslated corner of an
otherwise-translated site read as broken rather than intentional, and this
content has no real audience that needs it live on the deployed domain
rather than readable straight from the repo.

`src/components/starlight/*.astro` overrides Starlight's default header,
page frame and theme handling with this site's own (`SiteHeader`,
`SiteFooter`, the site's own theme toggle), so a `/docs` visitor sees the
same site they were just using rather than a bolted-on docs tool. See the
comments in `src/components/starlight/ThemeProvider.astro` and
`ThemeSelect.astro` for the specifics, and issue #114 for the original
full-parity decision.

## Everything else client-side

`@washy-washy/pdf` (the PDF rendering both this app and the CLI share) is
dynamically imported only when a download button is actually clicked
(`SheetViewer.tsx`'s `handleDownloadPhone`/`handleDownloadPrint`/
`handleDownloadCard`) — filtering the chart never pulls in `@react-pdf/
renderer` or `pdf-lib`, both sizeable, for a render nobody asked for yet.
