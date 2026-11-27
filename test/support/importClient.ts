import { GlobalRegistrator } from "@happy-dom/global-registrator";

/**
 * Imports a `?client` component with a DOM in place. Since Svelte 5.59 a
 * client-compiled component imports `svelte/internal/init-operations`, which
 * reads `window` and `document` as soon as it loads, so a static import fails
 * before any test has registered happy-dom. The DOM is unregistered again
 * afterwards, so each test still registers its own.
 */
export async function importClient<T>(load: () => Promise<T>): Promise<T> {
  GlobalRegistrator.register();
  try {
    return await load();
  } finally {
    await GlobalRegistrator.unregister();
  }
}
