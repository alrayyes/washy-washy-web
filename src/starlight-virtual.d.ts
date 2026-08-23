/**
 * Starlight declares these virtual-module types itself
 * (`@astrojs/starlight/virtual-internal.d.ts`), but only as a private
 * file, not part of its package `exports` — reachable when type-checking
 * Starlight's own source, not a consumer's. `PageFrame.astro` needs the
 * virtual specifier specifically (not a direct `@astrojs/starlight/
 * components/*.astro` import) so it resolves to whatever override this
 * project itself registers in `astro.config.mjs`, not always Starlight's
 * raw default — this file is just enough typing to let `astro check`
 * see through that specifier (#114).
 */
declare module "virtual:starlight/components/MobileMenuToggle" {
  const MobileMenuToggle: import("astro").AstroComponentFactory;
  export default MobileMenuToggle;
}
