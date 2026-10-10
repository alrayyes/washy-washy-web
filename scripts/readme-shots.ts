/**
 * The pages the README shows, and what their screenshot files are called.
 * Kept apart from the capture script so a unit test can read it without
 * starting a browser.
 *
 * Every English page except the ones the footer links to (disclaimer and
 * privacy), which are legal text rather than something to show off.
 */
export const COLOR_SCHEMES = ["light", "dark"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export interface ReadmePage {
  route: string;
  /** Stem of the file name, and the picture's alt text. */
  name: string;
  alt: string;
  /** Pages with a React island wait for it to hydrate before the shot. */
  hydrated: boolean;
}

export const README_PAGES: ReadmePage[] = [
  { route: "/", name: "home", alt: "Washing instructions for a pile of laundry", hydrated: true },
  { route: "/config", name: "config", alt: "Editing the washing chart", hydrated: true },
  {
    route: "/config/machine",
    name: "machine-editor",
    alt: "Editing washer and iron settings",
    hydrated: true,
  },
  { route: "/changelog", name: "changelog", alt: "The changelog", hydrated: false },
  { route: "/docs", name: "docs", alt: "The documentation home page", hydrated: false },
  {
    route: "/docs/web-app",
    name: "docs-web-app",
    alt: "Documentation: the web app",
    hydrated: false,
  },
  {
    route: "/docs/chart-and-machine",
    name: "docs-chart-and-machine",
    alt: "Documentation: the chart and the machine",
    hydrated: false,
  },
  {
    route: "/docs/ai-prompt",
    name: "docs-ai-prompt",
    alt: "Documentation: the AI prompt",
    hydrated: false,
  },
  { route: "/docs/webmcp", name: "docs-webmcp", alt: "Documentation: WebMCP", hydrated: false },
];

export function shotFile(page: ReadmePage, scheme: ColorScheme): string {
  return `${page.name}-${scheme}.png`;
}
