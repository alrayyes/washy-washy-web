import { compile } from "svelte/compiler";

/**
 * Bun has no built-in loader for `.svelte` files — Astro's own pipeline
 * (`@astrojs/svelte`, backed by `vite-plugin-svelte`) only runs inside
 * Astro's Vite build, never under `bun test`. This is the first place this
 * repo server-renders a `.svelte` component from a test (#243), so `bun
 * test` needs its own equivalent: a `Bun.plugin` loader that compiles the
 * component to its `generate: "server"` output — the same target
 * `svelte/server`'s `render()` expects — before Bun evaluates the import.
 *
 * Registered only under `[test]` in `bunfig.toml`, so it has no effect on
 * `astro dev`/`astro build`, which never go through Bun's module loader.
 */
Bun.plugin({
  name: "svelte-server-compile",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
      const source = await Bun.file(path).text();
      const { js } = compile(source, {
        filename: path,
        generate: "server",
      });
      return { contents: js.code, loader: "js" };
    });
  },
});
