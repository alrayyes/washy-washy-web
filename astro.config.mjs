// Static output: Cloudflare Workers serves the built `dist/` directory
// directly as static assets (apps/web/wrangler.jsonc), with no adapter or
// SSR runtime needed. The filtered sheet rendering (ticket #44) runs
// client-side, as an island — the site itself stays plain HTML/JS.
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://washy-washy.ryankes.eu",
  output: "static",
  integrations: [
    // The sheet viewer (#44) is a React island — the same @react-pdf/renderer
    // components src/documents.tsx uses, running client-side.
    react(),
    // Content lives one level deeper than Starlight's own default
    // (src/content/docs/docs/, not src/content/docs/) specifically so its
    // pages land under /docs/... instead of taking over the site's root —
    // the documented way to run Starlight at a subpath alongside an
    // existing app's own pages (#12).
    starlight({
      title: "Washy washy docs",
      description:
        "How to use washy-washy: the web app's filters, uploads and persisted state, the chart and machine file format, and generating a config with AI.",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/alrayyes/washy-washy" },
      ],
      editLink: {
        baseUrl: "https://github.com/alrayyes/washy-washy-web/edit/main/",
      },
      // The site's own header and page frame, not Starlight's — so
      // /docs reads as part of washy-washy rather than a separate site
      // bolted on next to it (#114). Starlight itself stays exactly as
      // the docs engine; only its chrome components are swapped, via its
      // own documented override mechanism. Starlight's own "Footer" is
      // deliberately NOT overridden — that's the per-page EditLink/
      // LastUpdated/Pagination strip inside the article, not the
      // site-wide footer (which PageFrame's override already appends);
      // overriding it too would show two copyright footers stacked. Its
      // optional "Built with Starlight" credit link is off by default
      // (`credits: false`) and never enabled here, so nothing Starlight-
      // branded reaches a visitor either way.
      components: {
        Header: "./src/components/starlight/Header.astro",
        PageFrame: "./src/components/starlight/PageFrame.astro",
        // Both fix the same problem as PageFrame above: Starlight's
        // defaults are `position: fixed` at an offset derived from
        // `--sl-nav-height`, which only makes sense below a header
        // that's also fixed at that height — ours isn't (#114).
        MobileMenuToggle: "./src/components/starlight/MobileMenuToggle.astro",
        MobileTableOfContents: "./src/components/starlight/MobileTableOfContents.astro",
        // Starlight ships its own independent dark/light system (a
        // separate localStorage key, a second theme-select control) —
        // these two replace it with the site's own, so there's one
        // theme source of truth on every page, docs included.
        ThemeProvider: "./src/components/starlight/ThemeProvider.astro",
        ThemeSelect: "./src/components/starlight/ThemeSelect.astro",
      },
      // Loads Tailwind (and this site's own colour/theme variables) on
      // docs pages too, since SiteHeader/SiteFooter above are styled with
      // Tailwind utility classes same as everywhere else (#114).
      customCss: ["./src/styles/global.css"],
      // No search trigger in SiteHeader (#114, user decision) — skips
      // building a pagefind index nothing queries, rather than shipping
      // unused search assets in dist/.
      pagefind: false,
      sidebar: [
        { label: "Overview", link: "/docs/" },
        { label: "The chart and machine files", link: "/docs/chart-and-machine/" },
        { label: "Using the web app", link: "/docs/web-app/" },
        { label: "Generate a config with AI", link: "/docs/ai-prompt/" },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
