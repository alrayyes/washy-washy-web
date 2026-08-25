import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Jive's own docs, rendered outside Starlight entirely (src/pages/jive/docs/
  // [...slug].astro) — Starlight can't register "jive" as a locale at all
  // (Intl.DisplayNames throws on its en-x-jive BCP-47 tag, confirmed live),
  // so /jive/docs never gets a real Starlight-i18n route the way /ja/docs
  // etc. do. Same four pages, same content, plain Markdown + frontmatter —
  // just a much smaller schema than docsSchema() needs, since nothing here
  // touches Starlight's own sidebar/pagination/badge machinery.
  docsJive: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/docs-jive" }),
    schema: z.object({ title: z.string(), description: z.string() }),
  }),
  // Same workaround, same reason — Intl.DisplayNames rejects en-x-linkedin
  // too — for the LinkedIn-speak locale's own docs
  // (src/pages/linkedin/docs/[...slug].astro).
  docsLinkedin: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/docs-linkedin" }),
    schema: z.object({ title: z.string(), description: z.string() }),
  }),
};
