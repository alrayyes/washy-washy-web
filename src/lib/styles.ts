/**
 * The one editable-field affordance both editors (`/config`,
 * `/config/machine`) share — always outlined, not invisible until
 * hovered. Invisible-until-hover has no touch equivalent, and phones are
 * this site's primary target (#58).
 */
export const TEXT_INPUT =
  "w-full min-w-[8rem] rounded border border-line bg-transparent px-1 py-0.5 text-body focus:border-accent focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
