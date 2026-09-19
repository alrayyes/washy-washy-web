import { compile } from "svelte/compiler";

/**
 * Bun has no built-in loader for `.svelte` files — Astro's own pipeline
 * (`@astrojs/svelte`, backed by `vite-plugin-svelte`) only runs inside
 * Astro's Vite build, never under `bun test`. This is the first place this
 * repo server-renders a `.svelte` component from a test (#243), so `bun
 * test` needs its own equivalent: a `Bun.plugin` loader that compiles the
 * component before Bun evaluates the import.
 *
 * Dual-mode (#243, `Sheet.svelte`'s own stage): most tests only ever need
 * `generate: "server"` output, the same target `svelte/server`'s `render()`
 * expects, and that's what a plain `import Foo from "./Foo.svelte"` still
 * gets. A test that needs to mount a component and drive it with real
 * clicks (`test/sheet-actions.test.ts`, ported from React's own
 * `react-dom/client` version) instead imports it with a `?client` suffix —
 * `import Sheet from "../src/components/Sheet.svelte?client"` — which
 * compiles the same source to `generate: "client"` output instead, the
 * target `mount`/`unmount`/`tick` (from the plain `"svelte"` package, not
 * `svelte/server`) expect.
 *
 * That split alone isn't enough, though: the bare `"svelte"` package's
 * exports are conditional, and `mount`/`unmount`/`tick` resolve to Svelte's
 * *server* build by default under plain `bun test` (confirmed live —
 * calling `mount()` throws `lifecycle_function_unavailable`), because Bun
 * doesn't set the `"browser"` export condition the way Vite does. The
 * fix — verified working — is `package.json`'s `"test"` script (and CI's
 * own coverage-instrumented invocation in `.github/workflows/check.yml`)
 * running `bun --conditions=browser test test/` rather than plain
 * `bun test test/`. `svelte/server`'s own `render()` is unaffected either
 * way — it's an unconditional export.
 *
 * A `?client`-suffixed entry point isn't the whole tree, either: Bun's
 * module cache keys on the exact resolved specifier, so `Sheet.svelte`'s
 * own plain (unsuffixed) imports of `SectionHeading.svelte`, `dials.svelte`
 * and `CardActions.svelte` would each independently resolve to *this*
 * plugin's `generate: "server"` branch regardless of how `Sheet.svelte`
 * itself was compiled — mixing a client-compiled parent with server-
 * compiled children throws (confirmed live: `$$renderer.component is not a
 * function`, server codegen calling a method the client runtime doesn't
 * have). The fix: once a file is compiled in `"client"` mode, rewrite its
 * own compiled output's `.svelte` import specifiers to carry `?client` too
 * — Bun then re-resolves each one as its own `?client` specifier, hitting
 * this same plugin again and compiling *that* file as `"client"` as well.
 * Recursive by construction: a client component's own client-compiled
 * children get the same treatment for anything **they** import, all the
 * way down. A plain (non-`?client`) entry point never triggers this
 * rewrite, so the ordinary server-render path (`test/sheet-render.test.ts`,
 * `test/sheet-fields.test.ts`) is untouched.
 *
 * Registered only under `[test]` in `bunfig.toml`, so none of this has any
 * effect on `astro dev`/`astro build`, which never go through Bun's module
 * loader.
 */
Bun.plugin({
  name: "svelte-compile",
  setup(build) {
    build.onLoad({ filter: /\.svelte(\?client)?$/ }, async ({ path }) => {
      const client = path.endsWith("?client");
      const realPath = client ? path.slice(0, -"?client".length) : path;
      const source = await Bun.file(realPath).text();
      const { js } = compile(source, {
        filename: realPath,
        generate: client ? "client" : "server",
      });
      const contents = client
        ? js.code.replaceAll(
            /(["'])([^"']+\.svelte)\1/g,
            (_match, quote, specifier) => `${quote}${specifier}?client${quote}`,
          )
        : js.code;
      return { contents, loader: "js" };
    });
  },
});
