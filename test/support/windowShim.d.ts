/**
 * `src/lib/urlHistory.ts` is the one `src/lib` file that reaches `window` —
 * every other file in this program is deliberately DOM-less (see
 * tsconfig.test.json's own comment, and url.ts's doc comment on why it
 * draws the line at that file). Pulling the full "DOM" lib into this
 * program to typecheck that one file would give every other test file
 * `Window`/`Document`/etc. globals it has no business seeing.
 *
 * This declares only the exact shape `writeUrlFilters` touches —
 * `window.location.pathname` and `window.history.replaceState` — nothing
 * else `lib.dom.d.ts` would bring in. It's type-only: Bun itself has no
 * `window` global at runtime either (confirmed live,
 * `bun -e "console.log(typeof window)"` prints "undefined"), so
 * test/url-history.test.ts stands up a real object matching this shape
 * before calling into the module under test.
 */
declare global {
  interface MinimalWindow {
    location: { pathname: string };
    history: {
      replaceState(data: unknown, unused: string, url?: string | null): void;
    };
  }

  var window: MinimalWindow;
}

export {};
