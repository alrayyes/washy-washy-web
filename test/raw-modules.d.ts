// Bun (and Vite) resolve a `?raw` import specifier as a plain string at
// runtime — see src/i18n/configSource.ts — but that's only *typed* via
// astro/client's ambient declarations, which src/env.d.ts wires up for the
// main tsconfig.json alone. tsconfig.test.json is a separate, deliberately
// DOM-less program (see src/lib/urlHistory.ts's own comment) that never
// includes env.d.ts, so it needs this minimal declaration of its own to
// resolve configSource.ts's imports once config-source.test.ts pulls them
// in transitively.
declare module "*?raw" {
  const content: string;
  export default content;
}
