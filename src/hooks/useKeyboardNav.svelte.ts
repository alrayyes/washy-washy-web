import { isSecondGPress, isTypingTarget, type TargetLike } from "../lib/keyboardNav";

const SCROLL_STEP = 120;

/**
 * Site-wide vim-style navigation — `j`/`k` scroll, `gg`/`G` jump to the
 * top/bottom, `/` focuses the page's own search field, `?` toggles the
 * help overlay. One module, one `window` listener, attached once
 * (`KeyboardNav.svelte`, in `SiteHeader`) rather than per page: none of
 * these bindings are page-specific, so there's nothing a second copy per
 * page would buy (#133).
 *
 * Deliberately navigation-only, no modal editing (`i` to insert, `Esc` to
 * leave a field) — real vim modes on a web form would fight native input
 * behaviour, since typing "j" in a text field has to keep typing "j", not
 * scroll the page. Scoped out with the user up front.
 *
 * `.svelte.ts`, not plain `.ts`: this needs `$state` at module scope so
 * `helpOpen` is shared reactive state rather than a value that's stale the
 * moment it's read outside the module that owns it.
 */

let helpOpen = $state(false);
// 0 means "no g pressed yet" — isSecondGPress treats that as never a pair.
let lastGPressAt = 0;

function handleKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (isTypingTarget(event.target as TargetLike | null)) return;

  if (event.key === "?") {
    event.preventDefault();
    helpOpen = !helpOpen;
    return;
  }

  // The overlay has its own focus trap and its own Escape handling
  // (native <dialog>, KeyboardNav.svelte) — none of the page-scrolling
  // bindings should also fire underneath it while it's open.
  if (helpOpen) return;

  switch (event.key) {
    case "j":
      window.scrollBy({ top: SCROLL_STEP, behavior: "smooth" });
      break;
    case "k":
      window.scrollBy({ top: -SCROLL_STEP, behavior: "smooth" });
      break;
    case "G":
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      break;
    case "g": {
      const now = Date.now();
      if (isSecondGPress(now, lastGPressAt)) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        lastGPressAt = 0;
      } else {
        lastGPressAt = now;
      }
      break;
    }
    case "/": {
      event.preventDefault();
      document.querySelector<HTMLElement>('input[type="search"]')?.focus();
      break;
    }
    default:
      break;
  }
}

/**
 * Attaches the single `window` keydown listener and returns its teardown —
 * call this from `KeyboardNav.svelte`'s `$effect` on mount, the same way
 * the original hook's `useEffect` attached on mount and its cleanup
 * function detached on unmount. Not exported as an `$effect` itself: an
 * effect has to run while a parent effect (or component initialisation) is
 * already active, so the mount/unmount wiring stays the caller's job.
 */
export function attachKeyboardNav(): () => void {
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}

// `helpOpen` can't be exported directly (it's reassigned, and Svelte can
// only wrap reads/writes of a reactive binding within the file that
// declares it) — a getter function is the documented way to share reactive
// state like this across modules.
export function isHelpOpen(): boolean {
  return helpOpen;
}

export function openHelp() {
  helpOpen = true;
}

export function closeHelp() {
  helpOpen = false;
}
