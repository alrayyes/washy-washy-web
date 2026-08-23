import { useCallback, useEffect, useRef, useState } from "react";
import { isSecondGPress, isTypingTarget, type TargetLike } from "../lib/keyboardNav";

const SCROLL_STEP = 120;

/**
 * Site-wide vim-style navigation — `j`/`k` scroll, `gg`/`G` jump to the
 * top/bottom, `/` focuses the page's own search field, `?` toggles the
 * help overlay. One hook, one `window` listener, mounted once
 * (`KeyboardNav.tsx`, in `SiteHeader`) rather than per page: none of these
 * bindings are page-specific, so there's nothing a second copy per page
 * would buy (#133).
 *
 * Deliberately navigation-only, no modal editing (`i` to insert, `Esc` to
 * leave a field) — real vim modes on a web form would fight native input
 * behaviour, since typing "j" in a text field has to keep typing "j", not
 * scroll the page. Scoped out with the user up front.
 */
export function useKeyboardNav() {
  const [helpOpen, setHelpOpen] = useState(false);
  // 0 means "no g pressed yet" — isSecondGPress treats that as never a pair.
  const lastGPressAt = useRef(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (isTypingTarget(event.target as TargetLike | null)) return;

      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen((open) => !open);
        return;
      }

      // The overlay has its own focus trap and its own Escape handling
      // (native <dialog>, KeyboardNav.tsx) — none of the page-scrolling
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
          if (isSecondGPress(now, lastGPressAt.current)) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            lastGPressAt.current = 0;
          } else {
            lastGPressAt.current = now;
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [helpOpen]);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  return { helpOpen, openHelp, closeHelp };
}
