import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { COLOR_SCHEMES, README_PAGES, shotFile } from "../scripts/readme-shots";

const README = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const FOOTER = readFileSync(new URL("../src/components/SiteFooter.astro", import.meta.url), "utf8");

const DOWNLOAD = "https://github.com/alrayyes/washy-washy-web/releases/latest/download/";
const allFiles = README_PAGES.flatMap((page) =>
  COLOR_SCHEMES.map((scheme) => shotFile(page, scheme)),
);

describe("README release screenshots", () => {
  test("cover every non-footer English page, light and dark", () => {
    expect(README_PAGES.map((page) => page.route)).toEqual([
      "/",
      "/config",
      "/config/machine",
      "/changelog",
      "/docs",
      "/docs/web-app",
      "/docs/chart-and-machine",
      "/docs/ai-prompt",
      "/docs/webmcp",
    ]);
    expect(allFiles).toHaveLength(18);
    expect(new Set(allFiles).size).toBe(18);
  });

  test("leave out every page the footer links to", () => {
    const footerRoutes = [...FOOTER.matchAll(/relativeLocaleUrl\(locale, "(\/[^"]*)"\)/g)].map(
      (match) => match[1],
    );

    expect(footerRoutes.length).toBeGreaterThan(0);
    for (const route of footerRoutes) {
      expect(README_PAGES.map((page) => page.route)).not.toContain(route);
    }
  });

  test("are all shown in the README, and the README shows nothing else", () => {
    const referenced = [...README.matchAll(new RegExp(`${DOWNLOAD}([\\w-]+\\.png)`, "g"))].map(
      (match) => match[1],
    );

    expect(new Set(referenced)).toEqual(new Set(allFiles));
  });
});
