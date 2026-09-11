import { describe, expect, test } from "bun:test";
import type { Instruction, Machine } from "@washy-washy/core";
import { resolve } from "@washy-washy/core";
import { renderToStaticMarkup } from "react-dom/server";
import { IronDial, ProgramDial } from "../src/components/dials";
import Sheet from "../src/components/Sheet";
import { translator } from "../src/i18n/ui";

const translate = translator("en");

/**
 * `react-dom/server` HTML-escapes text nodes (an apostrophe comes out as
 * `&#x27;`, among others), so a translated string with one never appears
 * verbatim in rendered markup. `t()` mirrors that escaping so
 * `.toContain(t(...))` compares like with like.
 */
function t(key: Parameters<typeof translate>[0], params?: Parameters<typeof translate>[1]): string {
  return translate(key, params)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

const machine: Machine = {
  washer: {
    name: "Test Washer",
    capacity: "8kg",
    programs: ["Cottons", "Synthetics", "Delicates"],
    temperatures: ["30", "40", "60"],
    spins: ["800", "1200", "1400"],
    options: ["Eco", "Extra Rinse"],
  },
  iron: {
    name: "Test Iron",
    settings: [
      { key: "1", dots: "•", label: "Low", detail: "Low heat", steam: false },
      { key: "2", dots: "••", label: "Medium", detail: "Medium heat", steam: true },
      { key: "3", dots: "•••", label: "High", detail: "High heat", steam: true },
    ],
  },
};

function instr(overrides: Partial<Instruction> & { clothingType: string }): Instruction {
  return {
    detergent: "Universal detergent",
    fabricSoftener: false,
    temperature: "40",
    spin: "800",
    duration: "~1:00",
    program: "Cottons",
    options: [],
    ironing: true,
    ironingNotes: "Iron notes",
    ironSetting: "2",
    drying: "Dry flat",
    colourGroup: "white",
    mixTags: [],
    notes: "Some notes",
    referenceName: "",
    referenceLink: "",
    ...overrides,
  };
}

/**
 * A hand-built chart, not the app's own `data/washy-washy.json.dist`
 * fixture: every branch below (wash-together vs. separately vs. alone, a
 * cited row with and without a link, an empty programs/settings list) needs
 * a specific combination `resolve()`'s real `canMix` never happens to
 * produce from realistic laundry data. Built once, shared by every test in
 * this file rather than re-derived per test — see the comment on each
 * clothing type for what it's there to prove.
 */
const raw: Instruction[] = [
  // Alpha + Beta: identical wash settings and colour, so they land in one
  // card together *and* can mix — but differ in detergent/drying/notes (the
  // "these piles disagree" side of SplitField/Prose) and in citation shape
  // (Alpha links its source, Beta cites one with no link).
  instr({
    clothingType: "Alpha",
    detergent: "Liquid detergent",
    drying: "Line dry",
    notes: "Handle carefully",
    referenceName: "Which?",
    referenceLink: "https://example.com/guide",
  }),
  instr({
    clothingType: "Beta",
    detergent: "Powder detergent",
    drying: "Tumble dry",
    notes: "Fine as-is",
    referenceName: "Care label",
    referenceLink: "",
  }),
  // Delta: the exact same wash settings and colour as Alpha/Beta, so it can
  // mix with both of them — but not ironed, so cardGroups puts it in its
  // own solo card, and Field's `alsoWith` ends up naming Alpha and Beta.
  instr({ clothingType: "Delta", ironing: false, ironSetting: "" }),
  // November: same settings/colour again, ironed at a different setting —
  // its own solo card too, and (with Delta) the second name `alsoWith`
  // needs to join, since `.join(", ")` on a single-element array can't
  // tell a real separator from an empty one.
  instr({ clothingType: "November", ironSetting: "1" }),
  // Echo + Foxtrot: identical wash settings but incompatible colours, so
  // they still share one card (cardGroups doesn't look at colour) but
  // *can't* actually mix — the "wash separately" branch.
  instr({
    clothingType: "Echo",
    program: "Synthetics",
    temperature: "60",
    spin: "1200",
    colourGroup: "white",
    ironSetting: "1",
  }),
  instr({
    clothingType: "Foxtrot",
    program: "Synthetics",
    temperature: "60",
    spin: "1200",
    colourGroup: "dark",
    ironSetting: "1",
  }),
  // Hotel + India: their own unique wash settings, fully compatible with
  // each other and nothing else — "wash together", no one else invited.
  // Same detergent/drying and no notes at all (Prose's "nothing to say"
  // and "every value the same" branches). ironingNotes is also empty for
  // both — Prose's own "nothing to say" check (not SplitField's separate
  // one, which gates the whole NOTES section before Prose ever runs) is
  // only actually exercised through IronPanel's bare `<Prose>` call, since
  // that's the one call site nothing else wraps in an early return first.
  instr({
    clothingType: "Hotel",
    program: "Delicates",
    temperature: "30",
    spin: "1400",
    options: ["Extra Rinse"],
    fabricSoftener: true,
    colourGroup: "colour",
    ironing: false,
    ironSetting: "",
    detergent: "Delicate wash",
    drying: "Flat dry",
    notes: "",
    ironingNotes: "",
  }),
  instr({
    clothingType: "India",
    program: "Delicates",
    temperature: "30",
    spin: "1400",
    options: ["Extra Rinse"],
    fabricSoftener: true,
    colourGroup: "colour",
    ironing: false,
    ironSetting: "",
    detergent: "Delicate wash",
    drying: "Flat dry",
    notes: "",
    ironingNotes: "",
  }),
  // Golf: `mixTags: ["solo"]` — canMix with nothing, ever, so it's alone
  // with nothing to add. Also carries the two special-cased display
  // values ("koud", a "0" spin) and colourGroup "any".
  instr({
    clothingType: "Golf",
    program: "Cottons",
    temperature: "koud",
    spin: "0",
    colourGroup: "any",
    mixTags: ["solo"],
    ironing: false,
    ironSetting: "",
  }),
  // Kilo: the only pile ironed at "3" — the iron cut's own grouping (by
  // ironSetting alone, ignoring wash settings) puts it in a solo card,
  // covering the singular "1 pile" count the other groups can't. Its own
  // temperature keeps it out of Alpha/Beta/Delta's wash fingerprint, so it
  // doesn't join their `canMix` web too. Also the only *solo* cited pile —
  // Alpha/Beta above are cited but share a card — so ReferenceField's own
  // "more than one pile" clothing-type prefix has a real off case to prove.
  instr({
    clothingType: "Kilo",
    temperature: "60",
    ironSetting: "3",
    referenceName: "Manual",
    referenceLink: "https://example.com/manual",
  }),
  // Papa/Quebec/Romeo: `canMix` is genuinely asymmetric here. Papa's colour
  // is "any" (mixes with anything), Quebec's is "white". Papa and Quebec
  // share a card and *can* mix with each other (Papa's "any" clears that).
  // Romeo — a separate card, "dark", otherwise identical settings — mixes
  // with Papa (again, "any") but not Quebec ("dark" vs "white"). Real
  // `alsoWith` requires *every* card member to mix with the outside name,
  // so Romeo must NOT show up in Papa/Quebec's own "and also" list even
  // though Papa alone would happily invite it — this is the one fixture
  // shape that can tell `Array.every` and `Array.some` apart here (a
  // 2-member group with matching colours can't: both members would always
  // agree on any outsider).
  instr({
    clothingType: "Papa",
    program: "Handwash",
    temperature: "50",
    spin: "600",
    colourGroup: "any",
    ironing: false,
    ironSetting: "",
  }),
  instr({
    clothingType: "Quebec",
    program: "Handwash",
    temperature: "50",
    spin: "600",
    colourGroup: "white",
    ironing: false,
    ironSetting: "",
  }),
  instr({
    clothingType: "Romeo",
    program: "Handwash",
    temperature: "50",
    spin: "600",
    colourGroup: "dark",
    ironing: true,
    ironSetting: "1",
  }),
  // Sierra/Tango/Uniform: three piles sharing one card, via the same
  // any/white/dark trick — Sierra ("any") mixes with both Tango and
  // Uniform, but Tango ("white") and Uniform ("dark") don't mix with each
  // other. `together` requires *every* pair to mix, not just one pile
  // mixing with the rest, so this card is "wash separately" even though
  // Sierra alone would happily join either. Distinguishes `Array.every`
  // from `Array.some` in the `together` check the same way Papa/Quebec/
  // Romeo does for `alsoWith` — a fully-agreeing or fully-disagreeing group
  // can't tell the two apart.
  // Sierra also has nothing to say for "notes" while Tango/Uniform do —
  // *some*, not *all*, of the group is silent, which is what tells
  // `Array.every`/`Array.some` apart for Prose's own "nothing to say" and
  // "collect the ones with something to say" checks (an all-empty or
  // all-non-empty group can't distinguish them).
  instr({
    clothingType: "Sierra",
    program: "Handwash2",
    temperature: "55",
    spin: "601",
    colourGroup: "any",
    ironing: false,
    ironSetting: "",
    notes: "",
  }),
  instr({
    clothingType: "Tango",
    program: "Handwash2",
    temperature: "55",
    spin: "601",
    colourGroup: "white",
    ironing: false,
    ironSetting: "",
    notes: "Needs care",
  }),
  instr({
    clothingType: "Uniform",
    program: "Handwash2",
    temperature: "55",
    spin: "601",
    colourGroup: "dark",
    ironing: false,
    ironSetting: "",
    notes: "Needs even more care",
  }),
];

const items = resolve(raw);

function render(variant: "full" | "wash" | "iron" = "full"): string {
  return renderToStaticMarkup(Sheet({ items, machine, variant }));
}

describe("Masthead", () => {
  test("shows its own fixed heading, the right subtitle for each cut, and the machine's own names", () => {
    expect(render("full")).toContain(`>${t("sheet.washingInstructions")}</h2>`);
    expect(render("full")).toContain(t("sheet.subtitleFull"));
    expect(render("wash")).toContain(t("sheet.subtitleWash"));
    expect(render("iron")).toContain(t("sheet.subtitleIron"));
    expect(render("full")).toContain("Test Washer, 8kg · Test Iron");
  });
});

describe("Loads", () => {
  test("explains what the TOGETHER badge means, and only shows it for a shared load", () => {
    const html = render("full");
    expect(html).toContain(t("sheet.loadsExplain"));

    const start = html.indexOf('class="rounded-md border border-hairline px-3"');
    const section = html.slice(start, html.indexOf("</section>", start));
    // Alpha/Beta/Delta/November all mix (loadGroups doesn't care that Delta
    // and November aren't ironed), so that's one shared load with the badge.
    expect(section).toContain(
      `Alpha  +  Beta  +  Delta  +  November<span class="ml-1.5 rounded bg-accent-soft px-1 py-0.5 text-xs font-bold tracking-wide text-accent-text">${t("sheet.together")}</span>`,
    );
    // Echo/Foxtrot can't mix with each other, so each is its own load, and
    // neither gets the badge (`group.length > 1` is false for a load of one).
    expect(section).not.toContain(`Echo<span`);
    expect(section).not.toContain(`Foxtrot<span`);
  });

  test("every load row but the last has a bottom border", () => {
    const html = render("full");
    const start = html.indexOf('class="rounded-md border border-hairline px-3"');
    const section = html.slice(start, html.indexOf("</section>", start));
    // The className template always leaves a trailing space before the
    // conditional border classes, even when they're empty — the last row's
    // own class ends in `py-2 "`, not `py-2"`.
    const rows = [
      ...section.matchAll(/<div class="flex items-start gap-2 py-2 (border-b border-hairline)?">/g),
    ];

    expect(rows.length).toBeGreaterThan(1);
    for (const row of rows.slice(0, -1)) expect(row[1]).toBe("border-b border-hairline");
    expect(rows.at(-1)?.[1]).toBeUndefined();
  });
});

describe("Legend", () => {
  test("falls back to the only programme as its own example when there's just one", () => {
    const oneProgram: Machine = { ...machine, washer: { ...machine.washer, programs: ["Solo"] } };
    const html = renderToStaticMarkup(Sheet({ items, machine: oneProgram, variant: "full" }));

    expect(html).toContain(t("sheet.legendWashExplain", { off: "Solo" }));
  });

  test("the wash cut draws the second programme as the example, and the full cut's extra suffix", () => {
    const full = render("full");
    const wash = render("wash");

    const explain = t("sheet.legendWashExplain", { off: "Cottons" });
    expect(full).toContain(explain);
    expect(full).toContain(t("sheet.legendWashExplainFullSuffix"));
    // The exact caption <p>, not a loose substring: "programme" (and
    // "thermostat", below) also show up inside the longer explain prose,
    // so a bare `.toContain` wouldn't notice the caption itself going
    // missing.
    expect(full).toContain(`>${t("sheet.legendProgrammeCaption")}</p>`);

    expect(wash).toContain(explain);
    expect(wash).not.toContain(t("sheet.legendWashExplainFullSuffix"));
  });

  test("the iron cut draws the hottest setting and its own caption/explain text", () => {
    const html = render("iron");

    expect(html).toContain(`>${t("sheet.legendThermostatCaption")}</p>`);
    expect(html).toContain(t("sheet.legendIronExplain"));
    expect(html).not.toContain(`>${t("sheet.legendProgrammeCaption")}</p>`);
  });

  test("draws the programme dial on the second programme specifically, not the first", () => {
    // Compared against dials.tsx's own component directly, not just a
    // presence check — the only way to tell "drew the right dial" from
    // "drew a dial" at all.
    const expectedDial = renderToStaticMarkup(
      ProgramDial({ program: "Synthetics", washer: machine.washer, size: 54 }),
    );
    expect(render("full")).toContain(expectedDial);
  });

  test("draws the thermostat dial on the machine's own hottest (last) setting", () => {
    const expectedDial = renderToStaticMarkup(
      IronDial({ setting: "3", settings: machine.iron.settings, size: 54 }),
    );
    expect(render("iron")).toContain(expectedDial);
  });

  test("falls back to empty strings rather than crashing on an empty programs/settings list", () => {
    const bareMachine: Machine = {
      washer: { ...machine.washer, programs: [] },
      iron: { ...machine.iron, settings: [] },
    };

    const full = renderToStaticMarkup(Sheet({ items, machine: bareMachine, variant: "full" }));
    const iron = renderToStaticMarkup(Sheet({ items, machine: bareMachine, variant: "iron" }));

    expect(full).toContain(t("sheet.legendWashExplain", { off: "" }));
    // Both dials fall back to their own defaults (index/position 0) rather
    // than throwing on an empty programs/settings list.
    expect(iron).toContain(renderToStaticMarkup(IronDial({ setting: "", settings: [], size: 54 })));
  });
});

describe("Card wash-together field", () => {
  test("two piles that can mix, with no one else invited", () => {
    const html = render("full");
    expect(html).toContain(t("sheet.washTogetherEachOther"));
  });

  test("two piles that can mix, plus who else could join them, joined by ', '", () => {
    // Two outsiders (Delta, November), not one — `.join(", ")` on a single
    // name can't tell a real separator from an empty one.
    const html = render("full");
    expect(html).toContain(t("sheet.washTogetherEachOtherAnd", { names: "Delta, November" }));
  });

  test("two piles that share a card but can't actually mix", () => {
    const html = render("full");
    expect(html).toContain(t("sheet.washSeparately"));
  });

  test("a solo pile names who it could join, when it isn't alone in the chart", () => {
    const html = render("full");
    expect(html).toContain("Alpha, Beta, November");
  });

  test("a solo pile that can't mix with anything says so plainly", () => {
    const html = render("full");
    expect(html).toContain(t("sheet.washAlone"));
  });
});

describe("Card mixing — every pile, not just one", () => {
  test("`alsoWith` only names an outsider every member of the card can mix with", () => {
    const html = render("full");
    const start = html.indexOf("Papa + Quebec");
    const card = html.slice(start, html.indexOf("</article>", start));

    // Papa (colour "any") mixes with Romeo, but Quebec ("white") doesn't
    // (Romeo is "dark") — Romeo has to be left out, even though a
    // same-vs-some check on either member alone would invite it.
    expect(card).toContain(t("sheet.washTogetherEachOther"));
    expect(html).not.toContain(t("sheet.washTogetherEachOtherAnd", { names: "Romeo" }));
    expect(html).not.toContain("Papa, Romeo");
  });

  test("`together` requires every pair to mix, not just one member mixing with the rest", () => {
    const html = render("full");
    const start = html.indexOf("Sierra + Tango + Uniform");
    const card = html.slice(start, html.indexOf("</article>", start));

    // Sierra ("any") mixes with both, but Tango ("white") and Uniform
    // ("dark") don't mix with each other — not every pair agrees, so this
    // card washes separately despite Sierra's own compatibility with both.
    expect(card).toContain(t("sheet.washSeparately"));
    expect(card).not.toContain(t("sheet.washTogetherEachOther"));
  });
});

describe("Card temperature/spin display", () => {
  test("'koud' shows as-is, not '°C', and the no-spin label replaces 'rpm'", () => {
    // Golf: temperature "koud", spin "0" — both special-cased, in one line.
    const html = render("full");
    expect(html).toContain(
      `<span class="text-xs font-bold text-ink">Cottons koud · ${t("common.noSpin")}</span>`,
    );
  });

  test("a real temperature always shows °C", () => {
    const html = render("full");
    expect(html).toContain("40 °C");
  });

  test("spin '0' shows the no-spin label instead of 'rpm'", () => {
    const html = render("full");
    expect(html).toContain(t("common.noSpin"));
  });

  test("a real spin speed shows rpm", () => {
    const html = render("full");
    expect(html).toContain("800 rpm");
  });
});

describe("SoftenerBadge", () => {
  test("shows the softener-ok badge, styled bg-yes, only for a pile that gets one", () => {
    const html = render("full");
    expect(html).toContain(
      `<span class="rounded px-1.5 py-0.5 text-xs font-bold text-white bg-yes">${t("common.softenerOk")}</span>`,
    );
  });

  test("shows the no-softener badge, styled bg-no, for a pile that doesn't", () => {
    const html = render("full");
    expect(html).toContain(
      `<span class="rounded px-1.5 py-0.5 text-xs font-bold text-white bg-no">${t("common.noSoftener")}</span>`,
    );
  });
});

describe("SplitField / Prose", () => {
  test("shows one line per pile when the group disagrees", () => {
    const html = render("full");
    expect(html).toContain("Alpha: ");
    expect(html).toContain("Liquid detergent");
    expect(html).toContain("Beta: ");
    expect(html).toContain("Powder detergent");
    // Drying is its own SplitField, reading its own field off each pile —
    // not accidentally sharing detergent's own callback.
    expect(html).toContain("Line dry");
    expect(html).toContain("Tumble dry");
  });

  test("collapses to a single line when the whole group agrees", () => {
    const html = render("full");
    expect(html).toContain("Delicate wash");
    expect(html).not.toContain("Hotel: ");
    expect(html).not.toContain("India: ");
  });

  test("renders nothing at all when nobody in the group has anything to say", () => {
    // Hotel/India's own notes are both "" — Field's whole section (heading
    // included) should be entirely absent for that card, not an empty one.
    const html = render("full");
    const hotelCardStart = html.indexOf("Hotel + India");
    const hotelCard = html.slice(hotelCardStart, html.indexOf("</article>", hotelCardStart));
    expect(hotelCard).not.toContain(t("common.notes").toUpperCase());
  });

  test("a per-pile line isn't emphasised — only Card's own wash-together Field is", () => {
    const html = render("full");
    // Alpha's own detergent line, via SplitField/Prose (no `emphasis` prop
    // passed anywhere in this file), must stay plain body text, not the
    // bold styling Field's own washTogetherWithLabel value gets below.
    expect(html).toContain(
      '<p class="text-sm leading-relaxed text-body "><span class="font-bold text-ink">Alpha: </span>Liquid detergent</p>',
    );
  });

  test("Field's own label is uppercased, and its value bolded", () => {
    const html = render("full");
    expect(html).toContain(`>${t("sheet.washTogetherWithLabel").toUpperCase()}<`);
    expect(html).toContain(
      `<p class="text-sm leading-relaxed font-bold text-ink">${t("sheet.washTogetherEachOther")}</p>`,
    );
  });

  test("SplitField's own label is uppercased too, and Prose's multi-line wrapper carries no class", () => {
    const html = render("full");
    // Alpha/Beta's own DETERGENT field: uppercased label, and the
    // surrounding <div> Prose wraps disagreeing lines in has no class of
    // its own (nothing was ever passed down from SplitField).
    expect(html).toContain(`>${t("common.detergent").toUpperCase()}<`);
    expect(html).toContain(
      '<div class=""><p class="text-sm leading-relaxed text-body "><span class="font-bold text-ink">Alpha: </span>',
    );
  });

  test("only the piles with something to say show up when some, not all, of the group is silent", () => {
    // Sierra's own notes are "", Tango/Uniform's aren't — a real gap
    // between "some" and "every"/"all", unlike Hotel/India (all silent) or
    // Alpha/Beta (all speaking).
    const html = render("full");
    const start = html.indexOf("Sierra + Tango + Uniform");
    const card = html.slice(start, html.indexOf("</article>", start));

    expect(card).toContain(t("common.notes").toUpperCase());
    expect(card).not.toContain("Sierra: ");
    expect(card).toContain(
      '<p class="text-sm leading-relaxed text-body "><span class="font-bold text-ink">Tango: </span>Needs care</p>',
    );
    expect(card).toContain(
      '<p class="text-sm leading-relaxed text-body mt-0.5"><span class="font-bold text-ink">Uniform: </span>Needs even more care</p>',
    );
  });
});

describe("ReferenceField", () => {
  test("a cited row with a link renders a real, safe off-site anchor", () => {
    const html = render("full");
    expect(html).toContain(t("common.source"));
    expect(html).toContain('href="https://example.com/guide"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  test("a cited row with no link renders the name as plain text", () => {
    const html = render("full");
    expect(html).toContain("Care label");
    expect(html).not.toContain('href=""');
  });

  test("a multi-pile card labels each citation by clothing type, and only the second gets mt-0.5", () => {
    // Includes each row's own reference content, not just the opening tag:
    // Prose's per-pile paragraphs (detergent/drying/notes, elsewhere on
    // this same card) share this exact class/span prefix, so a shorter
    // match would trivially find one of those instead.
    const html = render("full");
    expect(html).toContain(
      '<p class="text-sm leading-relaxed text-body "><span class="font-bold text-ink">Alpha: </span><a href="https://example.com/guide"',
    );
    expect(html).toContain(
      '<p class="text-sm leading-relaxed text-body mt-0.5"><span class="font-bold text-ink">Beta: </span>Care label</p>',
    );
  });

  test("a solo pile's own citation has no clothing-type prefix at all", () => {
    // Kilo is cited but the only pile in its own card.
    const html = render("full");
    expect(html).toContain(
      '<p class="text-sm leading-relaxed text-body "><a href="https://example.com/manual"',
    );
    expect(html).not.toContain("Kilo: ");
  });

  test("a card with no citations at all has no SOURCE section", () => {
    const html = render("full");
    const hotelCardStart = html.indexOf("Hotel + India");
    const hotelCard = html.slice(hotelCardStart, html.indexOf("</article>", hotelCardStart));
    expect(hotelCard).not.toContain(t("common.source"));
  });
});

describe("IronPanel / IronCard", () => {
  test("an ironed pile inside the steam zone says so", () => {
    const html = render("full");
    expect(html).toContain(t("common.insideSteamZone"));
  });

  test("an ironed pile below the steam zone says so instead", () => {
    const html = render("full");
    expect(html).toContain(t("common.belowSteamZone"));
  });

  test("a never-ironed pile says do not iron, not a thermostat label", () => {
    const html = render("full");
    expect(html).toContain(t("common.doNotIron"));
  });

  test("an ironed pile's own IronPanel names the exact setting, label and detail", () => {
    const html = render("full");
    expect(html).toContain('<p class="text-sm font-bold text-ink">Medium — Medium heat</p>');
  });

  test("IronPanel's own ironing notes are never bold — Field's own value is the only emphasised text", () => {
    const html = render("full");
    expect(html).toContain('<p class="text-sm leading-relaxed text-body mt-1">Iron notes</p>');
  });

  test("IronPanel's own Prose call renders nothing when the whole group has no ironing notes", () => {
    // Hotel/India's own ironingNotes are both "" — unlike SplitField's own
    // fields, nothing wraps this call in an early return of its own, so
    // this is the one place Prose's *own* "nothing to say" check is what's
    // actually doing the work.
    const html = render("full");
    const start = html.indexOf("Hotel + India");
    const card = html.slice(start, html.indexOf("</article>", start));
    expect(card).not.toContain('class="text-sm leading-relaxed text-body mt-1"');
  });

  test("only a never-ironed pile's own dial is drawn crossed out — an ironed one never is", () => {
    const html = render("full");
    const alphaStart = html.indexOf("Alpha + Beta"); // ironing: true
    const alphaCard = html.slice(alphaStart, html.indexOf("<article", alphaStart));
    const deltaStart = html.indexOf(">2. Delta<"); // ironing: false
    const deltaCard = html.slice(deltaStart, html.indexOf("<article", deltaStart));

    // "off" (crossed-out) is the only thing that draws var(--color-no).
    expect(alphaCard).not.toContain("var(--color-no)");
    expect(deltaCard).toContain("var(--color-no)");
  });

  test("the iron cut's own card names the thermostat setting and pile count", () => {
    const html = render("iron");
    // The card's own <h3> heading — IronCard's own copy of the
    // label/detail template, distinct from IronPanel's.
    expect(html).toContain(">2. Medium — Medium heat</h3>");
    expect(html).toContain(t("sheet.thermostatOn", { label: "Medium" }));
    // SectionHeading uppercases whatever it's given.
    expect(html).toContain(t("sheet.howHeading").toUpperCase());
    expect(html).toContain(`>${t("sheet.pileCountOther", { count: 2 })}</span>`);
    // IronCard's own steam-zone copy, distinct from IronPanel's — Alpha's
    // group is ironed at "2" (Medium), which steams.
    expect(html).toContain(t("common.insideSteamZone"));
  });

  test("the iron cut's never-iron group gets its own heading and copy", () => {
    const html = render("iron");
    // The card's own <h3> — IronCard's copy of the label/detail-or-doNotIron
    // template, for the branch an ironed group (tested above) never takes.
    expect(html).toContain(`. ${t("common.doNotIron")}</h3>`);
    expect(html).toContain(t("sheet.neverTheseHeading").toUpperCase());
    expect(html).toContain(t("sheet.leaveIronOff"));
    expect(html).toContain(t("sheet.neverNearBoard"));
    // Delta, Hotel, India, Golf, Papa, Quebec, Sierra, Tango and Uniform
    // are all `ironing: false` — the iron cut merges every never-ironed
    // pile into one "do not iron" group regardless of wash settings.
    expect(html).toContain(t("sheet.pileCountOther", { count: 9 }));
  });

  test("the iron cut's own below-steam-zone copy shows for a setting that doesn't steam", () => {
    // Echo/Foxtrot/Romeo are all ironed at "1" (Low), which doesn't steam.
    const html = render("iron");
    expect(html).toContain(">1. Low — Low heat</h3>");
    expect(html).toContain(t("common.belowSteamZone"));
  });

  test("a solo pile in the iron cut uses the singular pile count, not the plural", () => {
    // Kilo is the only pile ironed at setting "3". The exact <span>, not a
    // loose substring — "1 piles" (the wrong, plural template) contains
    // "1 pile" as a prefix, so a bare `.toContain` wouldn't tell them apart.
    const html = render("iron");
    expect(html).toContain(`>${t("sheet.pileCountOne", { count: 1 })}</span>`);
    expect(html).not.toContain(`>${t("sheet.pileCountOther", { count: 1 })}</span>`);
  });

  test("the iron cut's own crossed-out dial is only ever the never-iron card's", () => {
    const html = render("iron");
    const medium = html.indexOf(t("sheet.thermostatOn", { label: "Medium" }));
    const mediumCard = html.slice(Math.max(0, medium - 2000), medium);
    const doNotIron = html.indexOf(t("sheet.leaveIronOff"));
    const doNotIronCard = html.slice(Math.max(0, doNotIron - 2000), doNotIron);

    expect(mediumCard).not.toContain("var(--color-no)");
    expect(doNotIronCard).toContain("var(--color-no)");
  });

  test("every member of a group is listed under it, by its own clothing type", () => {
    const html = render("iron");
    const medium = html.indexOf(t("sheet.thermostatOn", { label: "Medium" }));
    const mediumCard = html.slice(medium, html.indexOf("</article>", medium));

    expect(mediumCard).toContain(
      '<span class="w-26 shrink-0 text-xs font-bold text-ink">Alpha</span>',
    );
    expect(mediumCard).toContain(
      '<span class="w-26 shrink-0 text-xs font-bold text-ink">Beta</span>',
    );
  });
});

describe("Sheet variant sections", () => {
  test("the wash cut hides the iron section entirely", () => {
    const html = render("wash");
    // A bare `t("common.iron")` ("Iron") is a substring of "Ironing" in the
    // Masthead's own subtitle, which every cut renders — check the section
    // heading's own exact (uppercased) markup instead.
    expect(html).not.toContain(`>${t("common.iron").toUpperCase()}<`);
    expect(html).not.toContain(t("common.insideSteamZone"));
    expect(html).not.toContain(t("common.belowSteamZone"));
  });

  test("the full and iron cuts both show an iron section or card", () => {
    expect(render("full")).toContain(`>${t("common.iron").toUpperCase()}<`);
    expect(render("iron")).toContain(t("sheet.thermostatOn", { label: "Medium" }));
  });

  test("the iron cut has no Loads section and no durations disclaimer", () => {
    const html = render("iron");
    expect(html).not.toContain(t("sheet.loadsHeading").toUpperCase());
    expect(html).not.toContain(t("sheet.durationsDisclaimer"));
  });

  test("the full and wash cuts both show the Loads section and the disclaimer", () => {
    for (const variant of ["full", "wash"] as const) {
      const html = render(variant);
      expect(html).toContain(t("sheet.loadsHeading").toUpperCase());
      expect(html).toContain(t("sheet.durationsDisclaimer"));
    }
  });
});

describe("ControlPanel / ChipRow", () => {
  test("names the programme's own position on the dial, clockwise from the first", () => {
    const html = render("full");
    expect(html).toContain(t("common.clockwiseFrom", { position: 0, off: "Cottons" }));
  });

  test("highlights exactly the temperature/spin/options this pile actually uses", () => {
    const html = render("full");
    expect(html).toContain(t("common.temp"));
    expect(html).toContain(t("common.spinRpm"));
    expect(html).toContain(t("common.buttons"));
    // Alpha's own temperature (40) is chosen; the machine's other one (30
    // and 60) isn't — different classes, not just different text.
    expect(html).toContain(
      '<span class="rounded border px-1.5 py-0.5 text-xs border-accent bg-accent font-bold text-white">40</span>',
    );
    expect(html).toContain(
      '<span class="rounded border px-1.5 py-0.5 text-xs border-hairline bg-surface text-muted">30</span>',
    );
    // Same again for spin — a separate ChipRow, reading the washer's own
    // spin list rather than an empty/wrong array.
    expect(html).toContain(
      '<span class="rounded border px-1.5 py-0.5 text-xs border-accent bg-accent font-bold text-white">800</span>',
    );
    expect(html).toContain(
      '<span class="rounded border px-1.5 py-0.5 text-xs border-hairline bg-surface text-muted">1200</span>',
    );
  });

  test("falls back to an empty 'off' position when the washer has no programmes at all", () => {
    const noPrograms: Machine = { ...machine, washer: { ...machine.washer, programs: [] } };
    const html = renderToStaticMarkup(Sheet({ items, machine: noPrograms, variant: "full" }));

    // The exact <p>, not a loose substring: a mutated, non-empty fallback
    // would still start with this same text, just with more after it.
    expect(html).toContain(`>${t("common.clockwiseFrom", { position: -1, off: "" })}</p>`);
  });
});

describe("Card/IronCard numbering and heading", () => {
  test("cards are numbered from 1, not 0 or in reverse", () => {
    const html = render("full");
    const first = html.indexOf("Alpha + Beta");
    // "1. " sits immediately before the heading text (inside the same <h3>).
    expect(html.slice(first - 3, first)).toBe("1. ");
  });

  test("a multi-pile card's own heading joins clothing types with a single ' + '", () => {
    const html = render("full");
    expect(html).toContain(">1. Alpha + Beta<");
    // Loads' own join (`"  +  "`, two spaces either side) is a different
    // separator for a different list — not to be confused with this one.
    expect(html).not.toContain("Alpha + Beta + Delta");
  });

  test("the iron cut's own cards are numbered from 1 too, in order — not just '1.' somewhere", () => {
    const html = render("iron");
    const headings = [...html.matchAll(/<h3[^>]*>([^<]+)</g)].map((m) => m[1]);
    const numbers = headings.map((h) => Number(h?.split(".")[0]));

    expect(numbers[0]).toBe(1);
    expect(numbers).toEqual(numbers.map((_, i) => i + 1));
  });
});
