// Static output: Cloudflare Workers serves the built `dist/` directory
// directly as static assets (apps/web/wrangler.jsonc), with no adapter or
// SSR runtime needed. The filtered sheet rendering (ticket #44) runs
// client-side, as an island — the site itself stays plain HTML/JS.
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { readUmamiConfig } from "./src/lib/analytics.ts";

// process.env here, not import.meta.env: this file runs as plain Node,
// before Vite's own module graph (and its import.meta.env handling)
// exists — Cloudflare's build environment still sets real process env
// vars, so this reads them the same way Layout.astro's import.meta.env
// does at the Vite-processed layer (#134).
const umami = readUmamiConfig(process.env);

export default defineConfig({
  site: "https://washy-washy.ryankes.eu",
  output: "static",
  // No Astro `i18n` config here on purpose: Starlight (below) introspects
  // the root i18n config at build time and validates every locale through
  // `Intl.Locale`/`Intl.DisplayNames` — which rejects "jive"'s and
  // "linkedin"'s BCP-47 private-use tags outright, and Starlight also
  // refuses to run with both a root i18n config and its own `locales`
  // option set (confirmed live, both throw). Routing, `lang` attributes and
  // hreflang alternates for the three per-locale pages (#143) are
  // hand-rolled in src/i18n/locales.ts instead, which keeps this decoupled
  // from Starlight's own (English-only for now, #144) i18n entirely.
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
      locales: {
        root: { label: "English", lang: "en" },
        ja: { label: "日本語", lang: "ja" },
        de: { label: "Deutsch", lang: "de" },
        es: { label: "Español", lang: "es" },
        fr: { label: "Français", lang: "fr" },
        // `dir` defaults to "ltr" and is NOT auto-derived from the BCP-47
        // tag when locales are configured directly like this (confirmed by
        // reading Starlight's own schema, user-config.ts — that derivation
        // only runs when converting *from* a root Astro i18n config, which
        // this project doesn't use, see the top-level comment above) — ar
        // needs it spelled out explicitly or its docs render LTR.
        ar: { label: "العربية", lang: "ar", dir: "rtl" },
        zh: { label: "简体中文", lang: "zh" },
        tr: { label: "Türkçe", lang: "tr" },
      },
      title: "Washy washy docs",
      description:
        "How to use washy-washy: the web app's filters, uploads and persisted state, the chart and machine file format, and generating a config with AI.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/alrayyes/washy-washy",
        },
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
        // Same redundancy as ThemeSelect above, now that Starlight has its
        // own locales too (#143/#144) — SiteHeader's LanguageSwitcher
        // already covers every page, docs included.
        LanguageSelect: "./src/components/starlight/LanguageSelect.astro",
      },
      // Loads Tailwind (and this site's own colour/theme variables) on
      // docs pages too, since SiteHeader/SiteFooter above are styled with
      // Tailwind utility classes same as everywhere else (#114).
      customCss: ["./src/styles/global.css"],
      // No search trigger in SiteHeader (#114, user decision) — skips
      // building a pagefind index nothing queries, rather than shipping
      // unused search assets in dist/.
      pagefind: false,
      // Same opt-in Umami toggle Layout.astro carries for the rest of
      // the site — /docs is covered too (#134), one script either way.
      head: umami
        ? [
            {
              tag: "script",
              attrs: {
                defer: true,
                src: umami.scriptUrl,
                "data-website-id": umami.websiteId,
              },
            },
          ]
        : [],
      // Every `label` below carries its own `translations` (#144 follow-up)
      // — Starlight's sidebar and its auto-generated Prev/Next pagination
      // both read from these same entries, so one translation covers both
      // the left-hand menu and the "link-title" under the Previous/Next
      // buttons.
      sidebar: [
        {
          label: "Overview",
          translations: {
            ja: "概要",
            de: "Überblick",
            es: "Resumen",
            fr: "Aperçu",
            ar: "نظرة عامة",
            zh: "概览",
            tr: "Genel bakış",
          },
          link: "/docs/",
        },
        {
          label: "The chart and machine files",
          translations: {
            ja: "チャートと洗濯機のファイル",
            de: "Die Wäsche- und Maschinendateien",
            es: "Los archivos de guía y máquina",
            fr: "Les fichiers de grille et de machine",
            ar: "ملفا المخطط والجهاز",
            zh: "图表与机器文件",
            tr: "Çizelge ve makine dosyaları",
          },
          link: "/docs/chart-and-machine/",
        },
        {
          label: "Using the web app",
          translations: {
            ja: "ウェブアプリを使う",
            de: "Die Web-App nutzen",
            es: "Usar la aplicación web",
            fr: "Utiliser l'application web",
            ar: "استخدام تطبيق الويب",
            zh: "使用网页应用",
            tr: "Web uygulamasını kullanma",
          },
          link: "/docs/web-app/",
        },
        {
          label: "Generate a config with AI",
          translations: {
            ja: "AIでconfigを生成",
            de: "Konfiguration mit KI erstellen",
            es: "Generar una configuración con IA",
            fr: "Générer une configuration avec l'IA",
            ar: "توليد إعداد بالذكاء الاصطناعي",
            zh: "用 AI 生成配置",
            tr: "Yapay zekayla yapılandırma oluşturma",
          },
          link: "/docs/ai-prompt/",
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
