<!--
  A troubleshooting view — and, since #74, an editor: the whole loaded
  config — machine and chart — in one structured place, rather than
  reconstructed by eye from the rendered cards.

  The one place a visitor manages the whole config: uploads, downloads
  and edits it here, machine and chart together as `@washy-washy/core`'s
  `Config` (`customConfig.ts`) — the index page only ever displays
  whatever's active, it carries no upload/download UI of its own.

  Ported from ConfigViewer.tsx (#245). No TranslationProvider here (that
  was a React Context) — this whole tree is Svelte now, so `t`/`locale`
  are a plain `$derived` value computed once here, the same as
  `SheetViewer.svelte`/`MachineEditor.svelte` (#243/#244). This is the
  last consumer of `TranslationProvider.tsx`, `SectionHeading.tsx` and
  `dials.tsx` (`ProgramDial`/`IronDial`) — all three are deleted alongside
  this port.

  Every helper below (ChipList, MachineSummary, ProseField,
  ChipSelectRow, ChipMultiRow, PillToggle, DurationField,
  EditableSplitField, ReferenceLink, ChartCards) is a snippet, not a
  separate component: none of them hold any state of their own, they're
  all plain render-from-props-plus-a-callback, the same reasoning
  `Sheet.svelte` (#243) already applied to its own read-only equivalents
  of several of these.

  ChartCards' own `{#each}` is keyed the same way the original was
  (`clothing_type-index`, a chart row has no id of its own) — every
  binding computed from a row inside that block is `{@const}`, never
  bare `{const}` (see this repo's own Svelte rule): editing a field
  (a chip click, a keystroke) changes the row's *values* without
  changing its key, exactly the shape that silently goes stale with the
  bare form.
-->
<script lang="ts">
import {
  type COLUMNS,
  type Config,
  colourGroups,
  configToJson,
  type Instruction,
  instructionsFromRows,
  type Machine,
  mixTags,
  type Row,
  RowError,
  rowsFromInstructions,
} from "@washy-washy/core/browser";
import { onMount } from "svelte";
import { type Locale, relativeLocaleUrl } from "../i18n/locales";
import { translator } from "../i18n/ui";
import {
  clearCustomConfig,
  readCustomConfig,
  uploadConfigFile,
  writeCustomConfig,
} from "../lib/customConfig";
import { isValidDuration } from "../lib/duration";
import { CHART_FIELD_LIMITS } from "../lib/fieldLimits";
import {
  ALERT,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  CHART_CARD,
  CHART_CARD_HEADER,
  FIELD_LABEL,
  LINK,
  SECTION_HEADING,
  TEXT_INPUT,
} from "../lib/styles";
import IronDial from "./IronDial.svelte";
import ProgramDial from "./ProgramDial.svelte";
import SectionHeading from "./SectionHeading.svelte";

const SECTION = "mb-6";
const SUB_PANEL = "rounded-md border border-hairline bg-panel p-3";
const CHIP_BUTTON = "rounded border px-1.5 py-0.5 text-xs";
const CHIP_BUTTON_ON = "border-accent bg-accent font-bold text-white";
const CHIP_BUTTON_OFF = "border-hairline bg-surface text-muted hover:border-line";
const PILL_BUTTON = "rounded px-1.5 py-0.5 text-xs font-bold text-white";

interface Props {
  items: Instruction[];
  machine: Machine;
  locale: Locale;
}

const { items: bundledItems, machine, locale }: Props = $props();

const t = $derived(translator(locale));

function splitPipe(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

let customConfig = $state<Config | null>(null);
let draftRows = $state<Row[]>(rowsFromInstructions(bundledItems));
let saveError = $state<string | null>(null);
let uploadError = $state<string | null>(null);
let sortField = $state<(typeof COLUMNS)[number] | "">("");
// Same hydration marker SheetViewer/MachineEditor expose, and for the
// same reason: the e2e suite needs a way to know Svelte has attached
// before it interacts.
let hydrated = $state(false);

onMount(() => {
  const restored = readCustomConfig();
  customConfig = restored;
  draftRows = rowsFromInstructions(restored?.chart ?? bundledItems);
  hydrated = true;
});

let sortOptions = $derived<{ value: (typeof COLUMNS)[number] | ""; label: string }[]>([
  { value: "", label: t("config.chartOrder") },
  { value: "clothing_type", label: t("common.pile") },
  { value: "detergent", label: t("common.detergent") },
  { value: "notes", label: t("common.notes") },
]);

let activeConfig = $derived<Config>(customConfig ?? { machine, chart: bundledItems });
let downloadHref = $derived(
  `data:application/json;charset=utf-8,${encodeURIComponent(configToJson(activeConfig))}`,
);

function handleCellChange(index: number, key: (typeof COLUMNS)[number], value: string) {
  draftRows = draftRows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
}

// A view-level reorder, not a mutation of draftRows itself: "no sort
// chosen" has to mean "back to chart order," and an edit made mid-sort has
// to land on the same row it was made on. Sorting the row's own index
// rather than the row keeps chartCards' onChange(index, ...) contract
// pointed at draftRows regardless of what order the cards are drawn in.
let sortedIndices = $derived.by(() => {
  const indices = draftRows.map((_, i) => i);
  if (!sortField) return indices;
  const field = sortField;
  return indices.sort((a, b) => draftRows[a][field].localeCompare(draftRows[b][field]));
});
let displayRows = $derived(sortedIndices.map((i) => draftRows[i]));

function handleSave() {
  try {
    // instructionsFromRows doesn't validate duration at all — it's free
    // text as far as @washy-washy/core is concerned — so this page owns
    // that check itself, in the same row/column shape RowError already
    // uses (#53).
    draftRows.forEach((row, index) => {
      const stripped = row.duration.replace(/^~/, "");
      if (!isValidDuration(stripped)) {
        throw new RowError(index + 2, "duration", `must match H:MM, found "${row.duration}"`);
      }
    });
    // Against the active machine — read-only here, editable on its own
    // page (#30) — so an edit that no longer fits (an unknown programme,
    // temperature or spin) is called out by row and column, not silently
    // accepted.
    const parsedChart = instructionsFromRows(draftRows, activeConfig.machine);
    const config: Config = { machine: activeConfig.machine, chart: parsedChart };
    customConfig = config;
    writeCustomConfig(config);
    saveError = null;
  } catch (reason) {
    saveError = reason instanceof Error ? reason.message : String(reason);
  }
}

function handleUpload(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  uploadConfigFile(file)
    .then((config) => {
      customConfig = config;
      draftRows = rowsFromInstructions(config.chart);
      uploadError = null;
    })
    .catch((reason) => {
      uploadError = reason instanceof Error ? reason.message : String(reason);
    });
}

function handleClear() {
  clearCustomConfig();
  customConfig = null;
  draftRows = rowsFromInstructions(bundledItems);
  saveError = null;
  uploadError = null;
}
</script>

{#snippet chipList(values: readonly string[])}
  <div class="mt-1 flex flex-wrap gap-1">
    {#each values as value (value)}
      <span class="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-body">
        {value}
      </span>
    {/each}
  </div>
{/snippet}

<!--
  Read-only — editing lives on its own page (#30), reached via the link
  below, so machine setup isn't lost among fifteen-per-pile chart cards.
-->
{#snippet machineSummary(summaryMachine: Machine)}
  {@const { washer, iron } = summaryMachine}
  <div class={CARD}>
    <div class="flex items-center justify-between gap-2">
      <p class="text-base font-bold text-ink">
        {washer.name} · {washer.capacity} · {iron.name}
      </p>
      <a
        href={relativeLocaleUrl(locale, "/config/machine")}
        class="shrink-0 rounded border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t("config.editMachine")}
      </a>
    </div>
    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <p class={FIELD_LABEL}>{t("config.programmes")}</p>
        {@render chipList(washer.programs)}
      </div>
      <div>
        <p class={FIELD_LABEL}>{t("config.temperatures")}</p>
        {@render chipList(washer.temperatures)}
      </div>
      <div>
        <p class={FIELD_LABEL}>{t("config.spinSpeeds")}</p>
        {@render chipList(washer.spins)}
      </div>
      <div>
        <p class={FIELD_LABEL}>{t("config.ironSettings")}</p>
        {@render chipList(iron.settings.map((setting) => setting.label))}
      </div>
    </div>
  </div>
{/snippet}

{#snippet proseField(
  value: string,
  name: string,
  onChange: (value: string) => void,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined,
  maxLength: number | undefined,
)}
  <textarea
    class={`${TEXT_INPUT} resize-none`}
    rows="2"
    {name}
    {value}
    oninput={(event) => onChange(event.currentTarget.value)}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
    maxlength={maxLength}
  ></textarea>
{/snippet}

<!--
  The clickable version of Sheet.svelte's read-only `chipRow` — same look
  (selected: filled accent, unselected: outlined), single-select. A real
  `<input type="radio">` per chip, visually hidden behind its `<label>` —
  the browser gives roving tabindex and arrow-key movement for free, which
  a `role="radio"` button would have to reimplement (and Biome's
  `useSemanticElements` rejects that reimplementation outright).
-->
{#snippet chipSelectRow(
  label: string,
  field: string,
  groupName: string,
  values: readonly string[],
  selected: string,
  onSelect: (value: string) => void,
)}
  <div class="mb-1 flex items-start gap-2">
    <span class="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
    <div class="flex flex-wrap gap-1" role="radiogroup" aria-label={label}>
      {#each values as value (value)}
        <label
          class={`relative ${CHIP_BUTTON} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-1 ${value === selected ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
        >
          <input
            type="radio"
            name={groupName}
            {value}
            checked={value === selected}
            onchange={() => onSelect(value)}
            class="absolute inset-0 cursor-pointer opacity-0"
            data-testid={`chip-${field}-${value}`}
          />
          {value}
        </label>
      {/each}
    </div>
  </div>
{/snippet}

<!-- The `|`-joined multi-value cousin of `chipSelectRow` — each chip toggles independently. -->
{#snippet chipMultiRow(
  label: string,
  name: string,
  values: readonly string[],
  selected: readonly string[],
  onToggle: (value: string) => void,
)}
  <div class="mb-1 flex items-start gap-2">
    <span class="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
    <div class="flex flex-wrap gap-1">
      {#each values as value (value)}
        <button
          type="button"
          data-testid={`chip-${name}-${value}`}
          aria-pressed={selected.includes(value)}
          class={`${CHIP_BUTTON} ${selected.includes(value) ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
          onclick={() => onToggle(value)}
        >
          {value}
        </button>
      {/each}
    </div>
  </div>
{/snippet}

<!-- The clickable version of Sheet.svelte's `softenerBadge` — same pill, toggles on click. -->
{#snippet pillToggle(
  on: boolean,
  onLabel: string,
  offLabel: string,
  name: string,
  onClick: () => void,
)}
  <button
    type="button"
    data-testid={`toggle-${name}`}
    aria-pressed={on}
    class={`${PILL_BUTTON} ${on ? "bg-yes" : "bg-no"}`}
    onclick={onClick}
  >
    {on ? onLabel : offLabel}
  </button>
{/snippet}

<!--
  A duration, not a time of day — `<input type="time">` renders a wall-clock
  picker (12-hour AM/PM in some locales), which read as "2:30 AM" for a wash
  cycle that takes about two and a half hours. Plain text avoids that.
-->
{#snippet durationField(
  value: string,
  name: string,
  rowId: number,
  onChange: (value: string) => void,
)}
  {@const stripped = value.replace(/^~/, "")}
  {@const invalid = stripped !== "" && !isValidDuration(stripped)}
  {@const hintId = `${name}-format-hint-${rowId}`}
  <div class="flex shrink-0 flex-col items-end gap-0.5">
    <div class="flex items-center gap-1">
      <span aria-hidden="true" class="text-body">~</span>
      <input
        class={`${TEXT_INPUT} w-16! min-w-0! ${invalid ? "border-no focus:border-no" : ""}`}
        type="text"
        inputmode="text"
        {name}
        aria-label={t("config.durationAriaLabel")}
        aria-invalid={invalid}
        aria-describedby={hintId}
        placeholder="2:30"
        maxlength={CHART_FIELD_LIMITS.duration - 1}
        value={stripped}
        oninput={(event) => {
          const next = event.currentTarget.value.replace(/^~/, "");
          onChange(next ? `~${next}` : "");
        }}
      />
    </div>
    <p id={hintId} class={invalid ? "text-xs text-no-text" : "sr-only"}>
      {invalid ? t("config.durationInvalidHint") : t("config.durationValidHint")}
    </p>
  </div>
{/snippet}

{#snippet editableSplitField(
  label: string,
  value: string,
  name: string,
  rowId: number,
  onChange: (value: string) => void,
  maxLength: number | undefined,
)}
  {@const labelId = `${name}-label-${rowId}`}
  <div class="mt-2">
    <!-- Not <SectionHeading> (#94): needs its own id for
    proseField's aria-labelledby (#66), which the component doesn't
    take — and same as Sheet.svelte's splitField/field, proseField's
    textarea carries no mt-* to collapse SectionHeading's mb-1
    against, so it would add a real 4px gap regardless. -->
    <p id={labelId} class="text-xs font-bold tracking-wide text-muted">
      {label.toUpperCase()}
    </p>
    {@render proseField(value, name, onChange, undefined, labelId, maxLength)}
  </div>
{/snippet}

<!--
  Where a washing instruction came from, when the row cites one — read
  only, same as `Sheet.svelte`'s `referenceField` (#79): this card is an
  editor for every other field, but citing a source isn't something a
  visitor fills in here, only something an uploaded chart can carry.
-->
{#snippet referenceLink(name: string, link: string)}
  {#if name !== ""}
    <div class="mt-2">
      <p class="text-xs font-bold tracking-wide text-muted">{t("common.source")}</p>
      <p class="text-sm leading-relaxed text-body">
        {#if link !== ""}
          <a href={link} target="_blank" rel="noopener noreferrer" class={LINK}>{name}</a>
        {:else}
          {name}
        {/if}
      </p>
    </div>
  {/if}
{/snippet}

<!--
  One card per pile, drawn to look like — and, since this is the same
  data, double as an editor for — `Sheet.svelte`'s read-only card: the
  same dial, the same chip rows for the values the machine constrains,
  the same softener pill. A chip is a button here instead of a `<span>`,
  and clicking one sets the field to its value; the free-text fields
  (detergent, notes, …) are the same textarea the previous, plainer
  version of this page used.

  The constrained fields (temperature, spin, programme, colour group,
  iron setting) can't produce an invalid value through this UI at all —
  the chips only ever offer valid ones. `instructionsFromRows` still
  validates on Save regardless; it's the single source of truth for
  what's valid, not duplicated here.
-->
{#snippet chartCards(
  rows: Row[],
  cardMachine: Machine,
  onChange: (index: number, key: (typeof COLUMNS)[number], value: string) => void,
)}
  {@const { washer, iron } = cardMachine}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="chart-cards">
    {#each rows as row, index (`${row.clothing_type}-${index}`)}
      {@const set = (key: (typeof COLUMNS)[number], value: string) => onChange(index, key, value)}
      {@const ironing = row.ironing === "yes"}
      {@const position = washer.programs.indexOf(row.program)}
      {@const off = washer.programs[0] ?? ""}
      {@const setting = iron.settings.find((s) => s.key === row.iron_setting)}
      <article class={CHART_CARD}>
        <div class={CHART_CARD_HEADER}>
          <!-- The labeled input below gives this heading its real
          accessible name via the accname algorithm (confirmed by
          e2e/config.spec.ts's own toHaveAccessibleName("White")
          assertion) — the compiler's static check doesn't credit a form
          control's label as "content". -->
          <!-- svelte-ignore a11y_missing_content -->
          <h3 class="min-w-0 flex-1">
            <input
              class={`${TEXT_INPUT} min-w-0! truncate text-base font-bold text-ink`}
              type="text"
              name="clothing_type"
              aria-label={t("common.pile")}
              maxlength={CHART_FIELD_LIMITS.clothingType}
              value={row.clothing_type}
              oninput={(event) => set("clothing_type", event.currentTarget.value)}
            />
          </h3>
          {@render durationField(row.duration, "duration", index, (value) =>
            set("duration", value),
          )}
        </div>

        <div class="mb-3 flex flex-wrap items-center gap-2">
          {@render pillToggle(
            row.fabric_softener === "yes",
            t("common.softenerOk"),
            t("common.noSoftener"),
            "fabric_softener",
            () => set("fabric_softener", row.fabric_softener === "yes" ? "no" : "yes"),
          )}
          <span class="text-xs font-bold text-ink">
            {row.program}
            {row.temperature === "koud" ? "koud" : `${row.temperature} °C`} ·
            {row.spin === "0" ? t("common.noSpin") : `${row.spin} rpm`}
          </span>
        </div>

        <div class={`flex gap-3 ${SUB_PANEL}`}>
          <div class="w-20 shrink-0 text-center">
            <ProgramDial program={row.program} {washer} size={78} />
            <select
              class="mt-1 w-full rounded border border-line bg-transparent px-0 text-center text-xs font-bold text-ink focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              name="program"
              aria-label={t("common.programme")}
              value={row.program}
              onchange={(event) => set("program", event.currentTarget.value)}
            >
              {#each washer.programs as program (program)}
                <option value={program}>{program}</option>
              {/each}
            </select>
            <p class="text-xs text-body">{t("common.clockwiseFrom", { position, off })}</p>
          </div>
          <div class="flex flex-1 flex-col justify-center">
            {@render chipSelectRow(
              t("common.temp"),
              "temperature",
              `temperature-${index}`,
              washer.temperatures,
              row.temperature,
              (value) => set("temperature", value),
            )}
            {@render chipSelectRow(
              t("common.spinRpm"),
              "spin",
              `spin-${index}`,
              washer.spins,
              row.spin,
              (value) => set("spin", value),
            )}
            {@render chipMultiRow(
              t("common.buttons"),
              "options",
              washer.options,
              splitPipe(row.options),
              (value) => {
                const next = new Set(splitPipe(row.options));
                if (next.has(value)) next.delete(value);
                else next.add(value);
                set("options", [...next].join("|"));
              },
            )}
          </div>
        </div>

        {@render editableSplitField(
          t("common.detergent"),
          row.detergent,
          "detergent",
          index,
          (value) => set("detergent", value),
          CHART_FIELD_LIMITS.detergent,
        )}

        <div class="mt-3">
          <SectionHeading text={t("common.iron")} />
          <div class={`flex items-center gap-3 ${SUB_PANEL}`}>
            <IronDial setting={row.iron_setting} settings={iron.settings} off={!ironing} size={62} />
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                {@render pillToggle(
                  ironing,
                  t("config.ironedLabel"),
                  t("common.doNotIron").toUpperCase(),
                  "ironing",
                  () => {
                    set("ironing", ironing ? "no" : "yes");
                    if (!ironing && row.iron_setting === "") {
                      set("iron_setting", iron.settings[0]?.key ?? "");
                    } else if (ironing) {
                      set("iron_setting", "");
                    }
                  },
                )}
                {#if ironing && setting}
                  <span class="text-xs font-bold text-ink">
                    {setting.label} — {setting.detail}
                  </span>
                {/if}
              </div>
              {#if ironing}
                <div class="mt-2 flex flex-wrap gap-1">
                  {#each iron.settings as s (s.key)}
                    <button
                      type="button"
                      data-testid={`chip-iron_setting-${s.key}`}
                      aria-pressed={s.key === row.iron_setting}
                      class={`${CHIP_BUTTON} ${
                        s.key === row.iron_setting ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF
                      }`}
                      onclick={() => set("iron_setting", s.key)}
                    >
                      {s.dots || s.label}
                    </button>
                  {/each}
                </div>
              {/if}
              {@render proseField(
                row.ironing_notes,
                "ironing_notes",
                (value) => set("ironing_notes", value),
                t("config.ironingNotesAriaLabel"),
                undefined,
                CHART_FIELD_LIMITS.ironingNotes,
              )}
            </div>
          </div>
        </div>

        {@render editableSplitField(
          t("sheet.dryingLabel"),
          row.drying,
          "drying",
          index,
          (value) => set("drying", value),
          CHART_FIELD_LIMITS.drying,
        )}

        <div class="mt-2">
          <SectionHeading text={t("config.colourGroupHeading")} />
          <div class="mt-1 flex flex-wrap gap-1">
            {#each colourGroups as group (group)}
              <button
                type="button"
                data-testid={`chip-colour_group-${group}`}
                aria-pressed={group === row.colour_group}
                class={`${CHIP_BUTTON} ${
                  group === row.colour_group ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF
                }`}
                onclick={() => set("colour_group", group)}
              >
                {group}
              </button>
            {/each}
          </div>
        </div>

        <div class="mt-2">
          <SectionHeading text={t("config.mixTagsHeading")} />
          <div class="mt-1 flex flex-wrap gap-1">
            {#each mixTags as tag (tag)}
              {@const selected = splitPipe(row.mix_tags)}
              {@const on = selected.includes(tag)}
              <button
                type="button"
                data-testid={`chip-mix_tags-${tag}`}
                aria-pressed={on}
                class={`${CHIP_BUTTON} ${on ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
                onclick={() => {
                  const next = new Set(selected);
                  if (next.has(tag)) next.delete(tag);
                  else next.add(tag);
                  set("mix_tags", [...next].join("|"));
                }}
              >
                {tag}
              </button>
            {/each}
          </div>
        </div>

        {@render editableSplitField(
          t("common.notes"),
          row.notes,
          "notes",
          index,
          (value) => set("notes", value),
          CHART_FIELD_LIMITS.notes,
        )}
        {@render referenceLink(row.reference_name, row.reference_link)}
      </article>
    {/each}
  </div>
{/snippet}

<div data-hydrated={hydrated}>
  <p class="mb-1 text-sm text-body">
    {customConfig ? t("common.showingOwnConfig") : t("config.showingBundledConfig")}
  </p>
  <p class="mb-6 text-xs text-muted">{t("config.uploadEditHelp")}</p>

  <section class={SECTION}>
    <h2 class={SECTION_HEADING}>{t("config.yourConfigHeading")}</h2>
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <label class="flex-1 sm:flex-none">
        <span class={FIELD_LABEL}>{t("common.uploadConfigJson")}</span>
        <input
          class="mt-1 block w-full text-sm text-body file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90"
          type="file"
          accept="application/json,.json"
          data-testid="page-upload-input"
          onchange={handleUpload}
        />
      </label>
      <a class={BUTTON_SECONDARY} href={downloadHref} download="washy-washy.json">
        {t("common.downloadCurrentConfig")}
      </a>
      {#if customConfig}
        <button class={BUTTON_SECONDARY} type="button" onclick={handleClear}>
          {t("config.useBundledInstead")}
        </button>
      {/if}
    </div>
    {#if uploadError}
      <p class={`${ALERT} mt-3`} role="alert">
        {t("common.couldNotUseFile", { error: uploadError })}
      </p>
    {/if}
  </section>

  <section class={SECTION}>
    <h2 class={SECTION_HEADING}>{t("config.machineHeading")}</h2>
    {@render machineSummary(activeConfig.machine)}
  </section>

  <section class={SECTION}>
    <h2 class={SECTION_HEADING}>{t("config.chartHeading")}</h2>
    <p class="mb-3 text-xs text-body">{t("config.chartEditHelp")}</p>
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <span class={FIELD_LABEL}>{t("config.sortBy")}</span>
      <div class="flex flex-wrap gap-1" role="radiogroup" aria-label={t("config.sortBy")}>
        {#each sortOptions as option (option.value)}
          <label
            class={`relative ${CHIP_BUTTON} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-1 ${sortField === option.value ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
          >
            <input
              type="radio"
              name="sort-by"
              value={option.value}
              checked={sortField === option.value}
              onchange={() => {
                sortField = option.value;
              }}
              class="absolute inset-0 cursor-pointer opacity-0"
            />
            {option.label}
          </label>
        {/each}
      </div>
    </div>
    {@render chartCards(displayRows, activeConfig.machine, (index, key, value) =>
      handleCellChange(sortedIndices[index], key, value),
    )}
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" class={BUTTON_PRIMARY} onclick={handleSave}>
        {t("common.saveChanges")}
      </button>
    </div>
    {#if saveError}
      <p class={`${ALERT} mt-3`} role="alert">
        {t("common.couldNotSave", { error: saveError })}
      </p>
    {/if}
  </section>
</div>
