# Island hydration

`SheetViewer`, `ConfigViewer` and `MachineEditor` are all `client:load`
islands: Astro server-renders their initial markup (the bundled example
chart, no filters, nothing restored yet), then React attaches to that markup
in the browser once its bundle has loaded. Between those two moments the page
looks fully interactive — the DOM nodes are there, a click or a keystroke on
them "succeeds" in the sense that the browser doesn't reject it — but nothing
is listening yet, since React hasn't attached its event handlers.

That gap is a real race, not a theoretical one. A script driving the page —
Playwright, or `scripts/capture-docs-media.ts`'s own screenshot automation —
that clicks a filter or fills a field before hydration finishes will find the
DOM node mutated (a `<select>`'s value genuinely changed) but the change
never reaches the component's own state, because the `onChange` handler
wasn't wired up when it fired. This mostly doesn't show up locally, where
hydration is fast enough that the window rarely gets hit — and then fails
intermittently in CI, where it's slower and more variable.

## The convention

Each of the three islands renders a wrapper element carrying
`data-hydrated={hydrated}`, where `hydrated` starts `false` and flips to
`true` at the end of the island's own mount effect — after it's finished
restoring whatever it needs to restore from `localStorage` or the URL, not
just after the component function has run once. `e2e/*.spec.ts`'s own `goto`
helpers wait on `page.waitForSelector('[data-hydrated="true"]')` before
touching anything on the page, and any other script driving these pages
(`capture-docs-media.ts` included) does the same.

If you add a fourth island with meaningful client-side state to restore, give
it the same flag — a Playwright script depends on the pattern being
consistent, not on this one component happening to follow it.

Islands without state to restore (`ThemeToggle`, `HeaderUpload`,
`KeyboardNav`) don't need their own `data-hydrated` — nothing waits on their
hydration specifically, and their own effects don't race anything the way a
restored filter or a restored upload does.
