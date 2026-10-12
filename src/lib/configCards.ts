/**
 * How many chart cards /config renders at a time (#348). The cards are all
 * open on purpose (#302), so each one is ~145 elements; the first batch plus
 * the rest of the page lands under Lighthouse's 1,400-element DOM budget, and
 * "Show more" reveals this many further cards per click.
 */
export const CONFIG_CARD_BATCH = 8;
