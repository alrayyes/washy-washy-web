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
