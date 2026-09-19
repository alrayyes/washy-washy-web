<script module lang="ts">
import {
  cardGroups,
  ironGroups,
  ironSettingKeys,
  type Machine,
  type ResolvedInstruction,
  type Variant,
  washGroups,
} from "@washy-washy/core/browser";

/** What makes an ironing card unique — see `packages/pdf`'s `documents.tsx`. */
export function ironCardKey(item: ResolvedInstruction): string {
  return item.ironing ? item.ironSetting : "do-not-iron";
}

export function sheetGroups(
  items: ResolvedInstruction[],
  machine: Machine,
  variant: Variant,
): ResolvedInstruction[][] {
  if (variant === "wash") return washGroups(items);
  if (variant === "iron") return ironGroups(items, ironSettingKeys(machine));
  return cardGroups(items);
}

const SUBTITLE_KEY: Record<
  Variant,
  "sheet.subtitleFull" | "sheet.subtitleWash" | "sheet.subtitleIron"
> = {
  full: "sheet.subtitleFull",
  wash: "sheet.subtitleWash",
  iron: "sheet.subtitleIron",
};
</script>

<script lang="ts">
import {
  canMix,
  durationsOf,
  formatTemperature,
  ironSetting,
  loadGroups,
  type Machine,
  type ResolvedInstruction,
  type Variant,
} from "@washy-washy/core/browser";
import type { TranslationParams, Ui } from "../i18n/ui";
import { CHART_CARD, CHART_CARD_HEADER, LINK } from "../lib/styles";
import CardActions from "./CardActions.svelte";
import IronDial from "./IronDial.svelte";
import ProgramDial from "./ProgramDial.svelte";
import SectionHeading from "./SectionHeading.svelte";

interface Props {
  items: ResolvedInstruction[];
  machine: Machine;
  variant: Variant;
  t: (key: keyof Ui, params?: TranslationParams) => string;
  /**
   * Per-card download/share — optional so `test/sheet-render.test.ts` can
   * render `Sheet` without them and so `variant === "iron"` (grouped by
   * thermostat setting, not by pile — no single "this card's pile" to
   * name) simply doesn't get the actions row at all.
   */
  onDownloadCard?: (group: ResolvedInstruction[]) => Promise<string[]>;
  onShareCard?: (group: ResolvedInstruction[]) => Promise<void>;
}

/**
 * The page itself: the same content `PhoneDocument` draws into a PDF —
 * loads, the dial legend, one card per pile grouping — as real HTML, so it
 * reads and scrolls like a page instead of an embedded PDF viewer. The PDF
 * is only ever generated on demand, by the download button.
 *
 * Mobile-first: one column by default, since this is meant to be read on a
 * phone standing in front of the machine — a two-column grid only kicks in
 * once there's room to actually read two cards side by side.
 *
 * Ported from Sheet.tsx (#243). `t` arrives as a plain prop rather than a
 * context/hook (there was no `useT()` equivalent to preserve): every helper
 * below is a snippet, not a separate component, so it already closes over
 * `t`/`machine`/`variant` from this file's own instance scope — only
 * `CardActions` is a real, separately-instantiated component (it needs its
 * own independent state per card), and it takes `t` as an explicit prop.
 */
let { items, machine, variant, t, onDownloadCard, onShareCard }: Props = $props();

let groups = $derived(sheetGroups(items, machine, variant));
let loadGroupsList = $derived(loadGroups(items));

// The "" fallback only ever runs when `settings` is empty, and IronDial's
// own `setting` prop only ever feeds a `findIndex` lookup against that
// same (then-empty) array — every value of `setting` produces the exact
// same "nothing found, fall back to index 0" render when there's nothing
// to find it in. Confirmed equivalent by inspection.
function hottestIronSetting(m: Machine): string {
  // Stryker disable next-line StringLiteral
  return m.iron.settings[m.iron.settings.length - 1]?.key ?? "";
}

// `alsoWith`'s own `group.every(member.mixesWith.includes(name))` check
// below already excludes any of this group's own members from ever
// qualifying as an "also invite" name — `resolve()` never lists an item
// in its own `mixesWith`, so that check fails for a self-referential name
// regardless of what `names` contains. This set exists to make that
// exclusion explicit, but nothing observable depends on its own contents
// being correct. Confirmed equivalent by inspection.
function namesOf(group: ResolvedInstruction[]): Set<string> {
  // Stryker disable next-line ArrowFunction
  return new Set(group.map((member) => member.clothingType));
}

// The `a === b` shortcut only matters when it would disagree with
// `canMix(a, a)` — and the only thing that makes an item incompatible
// with itself is its own "solo" tag, which also blocks every one of that
// item's *other* pairings the exact same way. Whenever the shortcut
// would change this one pairing's answer, some other pairing in the same
// `every` already forces the same false result. Confirmed equivalent by
// inspection.
function washesTogether(group: ResolvedInstruction[]): boolean {
  // Stryker disable next-line ConditionalExpression
  return group.every((a) => group.every((b) => a === b || canMix(a, b)));
}
</script>

{#snippet masthead()}
  <header class="mb-4">
    <h2 class="text-xl font-bold text-ink sm:text-2xl">{t("sheet.washingInstructions")}</h2>
    <p class="mt-1 text-sm text-muted">{t(SUBTITLE_KEY[variant])}</p>
    <p class="text-sm text-muted">
      {machine.washer.name}, {machine.washer.capacity} · {machine.iron.name}
    </p>
  </header>
{/snippet}

{#snippet loads()}
  <section class="mb-4">
    <SectionHeading text={t("sheet.loadsHeading")} />
    <p class="mb-2 text-xs text-muted">{t("sheet.loadsExplain")}</p>
    <div class="rounded-md border border-hairline px-3">
      {#each loadGroupsList as group, index ((group[0] as ResolvedInstruction).clothingType)}
        {const first = group[0] as ResolvedInstruction}
        {const joined = group.map((item) => item.clothingType).join("  +  ")}
        <div
          class={`flex items-start gap-2 py-2 ${
            index === loadGroupsList.length - 1 ? "" : "border-b border-hairline"
          }`}
        >
          <span class="w-18 shrink-0 text-xs font-bold text-accent-text">
            {first.program} {formatTemperature(first.temperature)}
          </span>
          <span class="flex-1 text-sm text-body">{joined}{#if group.length > 1}<span class="ml-1.5 rounded bg-accent-soft px-1 py-0.5 text-xs font-bold tracking-wide text-accent-text">{t("sheet.together")}</span>{/if}</span>
          <span class="shrink-0 text-xs text-muted">{durationsOf(group)}</span>
        </div>
      {/each}
    </div>
  </section>
{/snippet}

{#snippet legend()}
  {const washer = machine.washer}
  {const off = washer.programs[0] ?? ""}
  {const example = washer.programs[1] ?? off}
  {const hottest = hottestIronSetting(machine)}
  <div class="mb-4 flex items-center gap-3 rounded-md bg-panel p-3">
    <div class="w-18 shrink-0 text-center">
      {#if variant === "iron"}
        <IronDial setting={hottest} settings={machine.iron.settings} size={54} />
      {:else}
        <ProgramDial program={example} washer={washer} size={54} />
      {/if}
      <p class="mt-1 text-xs text-body">
        {variant === "iron" ? t("sheet.legendThermostatCaption") : t("sheet.legendProgrammeCaption")}
      </p>
    </div>
    <p class="text-sm leading-relaxed text-body">
      {#if variant === "iron"}
        {t("sheet.legendIronExplain")}
      {:else}
        {t("sheet.legendWashExplain", { off })}{#if variant === "full"}{t("sheet.legendWashExplainFullSuffix")}{/if}
      {/if}
    </p>
  </div>
{/snippet}

{#snippet chipRow(label: string, values: readonly string[], selected: readonly string[])}
  <div class="mb-1 flex items-start gap-2">
    <span class="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
    <div class="flex flex-wrap gap-1">
      {#each values as value (value)}
        {const on = selected.includes(value)}
        <span
          class={`rounded border px-1.5 py-0.5 text-xs ${
            on
              ? "border-accent bg-accent font-bold text-white"
              : "border-hairline bg-surface text-muted"
          }`}
        >
          {value}
        </span>
      {/each}
    </div>
  </div>
{/snippet}

{#snippet controlPanel(item: ResolvedInstruction)}
  {const washer = machine.washer}
  {const position = washer.programs.indexOf(item.program)}
  {const off = washer.programs[0] ?? ""}
  <div class="flex gap-3 rounded-md border border-hairline bg-panel p-3">
    <div class="w-20 shrink-0 text-center">
      <ProgramDial program={item.program} washer={washer} size={78} />
      <p class="mt-1 text-xs font-bold text-ink">{item.program}</p>
      <p class="text-xs text-body">{t("common.clockwiseFrom", { position, off })}</p>
    </div>
    <div class="flex flex-1 flex-col justify-center">
      {@render chipRow(t("common.temp"), washer.temperatures, [item.temperature])}
      {@render chipRow(t("common.spinRpm"), washer.spins, [item.spin])}
      {@render chipRow(t("common.buttons"), washer.options, item.options)}
    </div>
  </div>
{/snippet}

{#snippet ironPanel(group: ResolvedInstruction[])}
  {const item = group[0] as ResolvedInstruction}
  {const setting = item.ironing ? ironSetting(machine, item.ironSetting) : undefined}
  <div class="flex items-center gap-3 rounded-md border border-hairline bg-panel p-3">
    <IronDial
      setting={item.ironSetting}
      settings={machine.iron.settings}
      off={!item.ironing}
      size={62}
    />
    <div class="flex-1">
      <p class="text-sm font-bold text-ink">
        {setting ? `${setting.label} — ${setting.detail}` : t("common.doNotIron")}
      </p>
      {#if setting}
        <p class="mt-0.5 text-xs text-body">
          {setting.steam ? t("common.insideSteamZone") : t("common.belowSteamZone")}
        </p>
      {/if}
      {@render prose(group, (entry) => entry.ironingNotes, "mt-1")}
    </div>
  </div>
{/snippet}

<!--
  No `emphasis` prop: every real caller (splitField, ironPanel) always
  wants plain body text — Card's own bold wash-together value goes through
  `field` instead, which has its own copy of this same ternary. An untaken
  branch here would be untested code with no caller to exercise it, same
  reasoning as `field`'s own now-removed default.
-->
{#snippet prose(items: ResolvedInstruction[], pick: (item: ResolvedInstruction) => string, className: string = "")}
  {const values = items.map(pick)}
  {const textClass = "text-sm leading-relaxed text-body"}
  {#if !values.every((value) => value === "")}
    {#if values.every((value) => value === values[0])}
      <p class={`${textClass} ${className}`}>{values[0]}</p>
    {:else}
      {const speaking = items.filter((_, index) => values[index] !== "")}
      <div class={className}>
        {#each speaking as item, index (item.clothingType)}
          <p class={`${textClass} ${index === 0 ? "" : "mt-0.5"}`}><span class="font-bold text-ink">{`${item.clothingType}: `}</span>{pick(item)}</p>
        {/each}
      </div>
    {/if}
  {/if}
{/snippet}

{#snippet splitField(label: string, items: ResolvedInstruction[], pick: (item: ResolvedInstruction) => string)}
  {#if !items.every((item) => pick(item) === "")}
    <div class="mt-2">
      <!-- Not <SectionHeading> (#94): its own mb-1 has no margin to
      collapse with here — prose's own <p> carries no mt-* — so it would
      add a real 4px gap that isn't there today. -->
      <p class="text-xs font-bold tracking-wide text-muted">{label.toUpperCase()}</p>
      {@render prose(items, pick)}
    </div>
  {/if}
{/snippet}

<!--
  Where a washing instruction came from, when a row cites one — a
  manufacturer's own guidance, a care label, a trade source. Hidden
  entirely when nothing in the group cites anything (#79); a group can
  mix cited and uncited members, so each cited member gets its own line
  rather than picking one to speak for the whole card.
-->
{#snippet referenceField(items: ResolvedInstruction[])}
  {const cited = items.filter((item) => item.referenceName !== "")}
  {#if cited.length > 0}
    <div class="mt-2">
      <p class="text-xs font-bold tracking-wide text-muted">{t("common.source")}</p>
      {#each cited as item, index (item.clothingType)}
        <p class={`text-sm leading-relaxed text-body ${index === 0 ? "" : "mt-0.5"}`}>{#if items.length > 1}<span class="font-bold text-ink">{`${item.clothingType}: `}</span>{/if}{#if item.referenceLink !== ""}<a href={item.referenceLink} target="_blank" rel="noopener noreferrer" class={LINK}>{item.referenceName}</a>{:else}{item.referenceName}{/if}</p>
      {/each}
    </div>
  {/if}
{/snippet}

<!--
  No `emphasis` prop, unlike prose/splitField above: Card's own use is this
  snippet's only call site, and it always wants the bold styling —
  a conditional with no caller ever taking its other branch is untested
  code, not real flexibility.
-->
{#snippet field(label: string, value: string)}
  <div class="mt-2">
    <!-- Not <SectionHeading> — same reason as splitField above (#94). -->
    <p class="text-xs font-bold tracking-wide text-muted">{label.toUpperCase()}</p>
    <p class="text-sm leading-relaxed font-bold text-ink">{value}</p>
  </div>
{/snippet}

{#snippet softenerBadge(on: boolean)}
  <span class={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${on ? "bg-yes" : "bg-no"}`}>
    {on ? t("common.softenerOk") : t("common.noSoftener")}
  </span>
{/snippet}

{#snippet cardSnippet(group: ResolvedInstruction[], index: number)}
  {const item = group[0] as ResolvedInstruction}
  {const heading = group.map((member) => member.clothingType).join(" + ")}
  {const names = namesOf(group)}
  {const together = washesTogether(group)}
  {const alsoWith = item.mixesWith.filter(
    (name) => !names.has(name) && group.every((member) => member.mixesWith.includes(name)),
  )}
  <article class={CHART_CARD}>
    <div class={CHART_CARD_HEADER}>
      <h3 class="text-base font-bold text-ink">
        {index}. {heading}
      </h3>
      <div class="flex shrink-0 items-center gap-2">
        <span class="text-xs font-bold text-accent-text">{durationsOf(group)}</span>
        {#if onDownloadCard && onShareCard}
          <CardActions {group} onDownload={onDownloadCard} onShare={onShareCard} {t} />
        {/if}
      </div>
    </div>

    <SectionHeading text={t("sheet.washHeading")} />
    <div class="mb-3 flex items-center gap-2">
      {@render softenerBadge(item.fabricSoftener)}
      <span class="text-xs font-bold text-ink">{item.program} {item.temperature === "koud" ? "koud" : `${item.temperature} °C`} · {item.spin === "0" ? t("common.noSpin") : `${item.spin} rpm`}</span>
    </div>

    {@render controlPanel(item)}

    {@render splitField(t("common.detergent"), group, (member) => member.detergent)}
    {@render field(
      t("sheet.washTogetherWithLabel"),
      group.length > 1 && together
        ? alsoWith.length > 0
          ? t("sheet.washTogetherEachOtherAnd", { names: alsoWith.join(", ") })
          : t("sheet.washTogetherEachOther")
        : group.length > 1
          ? t("sheet.washSeparately")
          : alsoWith.length > 0
            ? alsoWith.join(", ")
            : t("sheet.washAlone"),
    )}
    {@render splitField(t("sheet.dryingLabel"), group, (member) => member.drying)}

    {#if variant !== "wash"}
      <div class="mt-3">
        <SectionHeading text={t("common.iron")} />
        {@render ironPanel(group)}
      </div>
    {/if}

    {@render splitField(t("common.notes"), group, (member) => member.notes)}
    {@render referenceField(group)}
  </article>
{/snippet}

{#snippet ironCardSnippet(group: ResolvedInstruction[], index: number)}
  {const item = group[0] as ResolvedInstruction}
  {const setting = item.ironing ? ironSetting(machine, item.ironSetting) : undefined}
  <article class={CHART_CARD}>
    <div class={CHART_CARD_HEADER}>
      <h3 class="text-base font-bold text-ink">
        {index}. {setting ? `${setting.label} — ${setting.detail}` : t("common.doNotIron")}
      </h3>
      <span class="shrink-0 text-xs text-muted">
        {group.length === 1
          ? t("sheet.pileCountOne", { count: group.length })
          : t("sheet.pileCountOther", { count: group.length })}
      </span>
    </div>

    <div class="flex items-center gap-3 rounded-md border border-hairline bg-panel p-3">
      <IronDial
        setting={item.ironSetting}
        settings={machine.iron.settings}
        off={!item.ironing}
        size={62}
      />
      <div class="flex-1">
        <p class="text-sm font-bold text-ink">
          {setting ? t("sheet.thermostatOn", { label: setting.label }) : t("sheet.leaveIronOff")}
        </p>
        <p class="mt-0.5 text-xs text-body">
          {setting
            ? setting.steam
              ? t("common.insideSteamZone")
              : t("common.belowSteamZone")
            : t("sheet.neverNearBoard")}
        </p>
      </div>
    </div>

    <div class="mt-3">
      <SectionHeading text={setting ? t("sheet.howHeading") : t("sheet.neverTheseHeading")} />
      {#each group as member (member.clothingType)}
        <div class="mt-1 flex items-start gap-2">
          <span class="w-26 shrink-0 text-xs font-bold text-ink">{member.clothingType}</span>
          <span class="text-xs text-body">{member.ironingNotes}</span>
        </div>
      {/each}
    </div>
  </article>
{/snippet}

{#snippet durationsDisclaimer()}
  <p class="mt-3 text-center text-xs text-muted italic">{t("sheet.durationsDisclaimer")}</p>
{/snippet}

<div>
  {@render masthead()}
  {#if variant !== "iron"}
    {@render loads()}
  {/if}
  {@render legend()}
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    {#each groups as group, index (variant === "iron" ? ironCardKey(group[0] as ResolvedInstruction) : (group[0] as ResolvedInstruction).clothingType)}
      {#if variant === "iron"}
        {@render ironCardSnippet(group, index + 1)}
      {:else}
        {@render cardSnippet(group, index + 1)}
      {/if}
    {/each}
  </div>
  {#if variant !== "iron"}
    {@render durationsDisclaimer()}
  {/if}
</div>
