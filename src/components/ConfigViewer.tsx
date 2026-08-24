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
import { useEffect, useMemo, useState } from "react";
import { type Locale, relativeLocaleUrl } from "../i18n/locales";
import { TranslationProvider, useLocale, useT } from "../i18n/TranslationProvider";
import {
  clearCustomConfig,
  readCustomConfig,
  uploadConfigFile,
  writeCustomConfig,
} from "../lib/customConfig";
import { isValidDuration } from "../lib/duration";
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
import { IronDial, ProgramDial } from "./dials";
import SectionHeading from "./SectionHeading";

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

function ChipList({ values }: { values: readonly string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {values.map((value) => (
        <span
          key={value}
          className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-body"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

/**
 * Read-only — editing lives on its own page (#30), reached via the link
 * below, so machine setup isn't lost among fifteen-per-pile chart cards.
 */
function MachineSummary({ machine }: { machine: Machine }) {
  const t = useT();
  const locale = useLocale();
  const { washer, iron } = machine;

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold text-ink">
          {washer.name} · {washer.capacity} · {iron.name}
        </p>
        <a
          href={relativeLocaleUrl(locale, "/config/machine")}
          className="shrink-0 rounded border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("config.editMachine")}
        </a>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className={FIELD_LABEL}>{t("config.programmes")}</p>
          <ChipList values={washer.programs} />
        </div>
        <div>
          <p className={FIELD_LABEL}>{t("config.temperatures")}</p>
          <ChipList values={washer.temperatures} />
        </div>
        <div>
          <p className={FIELD_LABEL}>{t("config.spinSpeeds")}</p>
          <ChipList values={washer.spins} />
        </div>
        <div>
          <p className={FIELD_LABEL}>{t("config.ironSettings")}</p>
          <ChipList values={iron.settings.map((setting) => setting.label)} />
        </div>
      </div>
    </div>
  );
}

function splitPipe(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function ProseField({
  value,
  name,
  onChange,
  ariaLabel,
  ariaLabelledBy,
}: {
  value: string;
  name: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}) {
  return (
    <textarea
      className={`${TEXT_INPUT} resize-none`}
      rows={2}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    />
  );
}

/**
 * The clickable version of Sheet.tsx's read-only `ChipRow` — same look
 * (selected: filled accent, unselected: outlined), single-select. A real
 * `<input type="radio">` per chip, visually hidden behind its `<label>` —
 * the browser gives roving tabindex and arrow-key movement for free, which
 * a `role="radio"` button would have to reimplement (and Biome's
 * `useSemanticElements` rejects that reimplementation outright).
 */
function ChipSelectRow({
  label,
  field,
  groupName,
  values,
  selected,
  onSelect,
}: {
  label: string;
  /** Stable across rows — used only for the data-testid, so e2e locators don't care which card. */
  field: string;
  /** Unique per row — the native radio `name`, which groups by DOM name across the whole page regardless of React component boundaries. */
  groupName: string;
  values: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mb-1 flex items-start gap-2">
      <span className="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={label}>
        {values.map((value) => (
          <label
            key={value}
            className={`relative ${CHIP_BUTTON} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-1 ${value === selected ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
          >
            <input
              type="radio"
              name={groupName}
              value={value}
              checked={value === selected}
              onChange={() => onSelect(value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              data-testid={`chip-${field}-${value}`}
            />
            {value}
          </label>
        ))}
      </div>
    </div>
  );
}

/** The `|`-joined multi-value cousin of `ChipSelectRow` — each chip toggles independently. */
function ChipMultiRow({
  label,
  name,
  values,
  selected,
  onToggle,
}: {
  label: string;
  name: string;
  values: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mb-1 flex items-start gap-2">
      <span className="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
      <div className="flex flex-wrap gap-1">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            data-testid={`chip-${name}-${value}`}
            aria-pressed={selected.includes(value)}
            className={`${CHIP_BUTTON} ${selected.includes(value) ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
            onClick={() => onToggle(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The clickable version of Sheet.tsx's `SoftenerBadge` — same pill, toggles on click. */
function PillToggle({
  on,
  onLabel,
  offLabel,
  name,
  onClick,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={`toggle-${name}`}
      aria-pressed={on}
      className={`${PILL_BUTTON} ${on ? "bg-yes" : "bg-no"}`}
      onClick={onClick}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

/**
 * A duration, not a time of day — `<input type="time">` renders a wall-clock
 * picker (12-hour AM/PM in some locales), which read as "2:30 AM" for a wash
 * cycle that takes about two and a half hours. Plain text avoids that.
 */
function DurationField({
  value,
  name,
  rowId,
  onChange,
}: {
  value: string;
  name: string;
  /** Makes the hint's id unique across every card's own copy of this field. */
  rowId: number;
  onChange: (value: string) => void;
}) {
  const t = useT();
  const stripped = value.replace(/^~/, "");
  const invalid = stripped !== "" && !isValidDuration(stripped);
  const hintId = `${name}-format-hint-${rowId}`;

  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5">
      <div className="flex items-center gap-1">
        <span aria-hidden="true" className="text-body">
          ~
        </span>
        <input
          className={`${TEXT_INPUT} w-16! min-w-0! ${invalid ? "border-no focus:border-no" : ""}`}
          type="text"
          // "numeric" requests a digits-only keypad on some Android
          // keyboards, with no ":" key — the one separator this format
          // needs (#53).
          inputMode="text"
          name={name}
          aria-label={t("config.durationAriaLabel")}
          aria-invalid={invalid}
          aria-describedby={hintId}
          placeholder="2:30"
          value={stripped}
          onChange={(event) => {
            const next = event.target.value.replace(/^~/, "");
            onChange(next ? `~${next}` : "");
          }}
        />
      </div>
      <p id={hintId} className={invalid ? "text-xs text-no-text" : "sr-only"}>
        {invalid ? t("config.durationInvalidHint") : t("config.durationValidHint")}
      </p>
    </div>
  );
}

function EditableSplitField({
  label,
  value,
  name,
  rowId,
  onChange,
}: {
  label: string;
  value: string;
  name: string;
  /** Makes the label's id unique across every card's own copy of this field. */
  rowId: number;
  onChange: (value: string) => void;
}) {
  const labelId = `${name}-label-${rowId}`;

  return (
    <div className="mt-2">
      {/* Not <SectionHeading> (#94): needs its own id for
      ProseField's aria-labelledby (#66), which the component doesn't
      take — and same as Sheet.tsx's SplitField/Field, ProseField's
      textarea carries no mt-* to collapse SectionHeading's mb-1
      against, so it would add a real 4px gap regardless. */}
      <p id={labelId} className="text-xs font-bold tracking-wide text-muted">
        {label.toUpperCase()}
      </p>
      <ProseField value={value} name={name} onChange={onChange} ariaLabelledBy={labelId} />
    </div>
  );
}

/**
 * Where a washing instruction came from, when the row cites one — read
 * only, same as `Sheet.tsx`'s `ReferenceField` (#79): this card is an
 * editor for every other field, but citing a source isn't something a
 * visitor fills in here, only something an uploaded chart can carry.
 */
function ReferenceLink({ name, link }: { name: string; link: string }) {
  const t = useT();
  if (name === "") return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-bold tracking-wide text-muted">{t("common.source")}</p>
      <p className="text-sm leading-relaxed text-body">
        {link !== "" ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className={LINK}>
            {name}
          </a>
        ) : (
          name
        )}
      </p>
    </div>
  );
}

/**
 * One card per pile, drawn to look like — and, since this is the same
 * data, double as an editor for — `Sheet.tsx`'s read-only card: the same
 * dial, the same chip rows for the values the machine constrains, the
 * same softener pill. A chip is a button here instead of a `<span>`, and
 * clicking one sets the field to its value; the free-text fields
 * (detergent, notes, …) are the same textarea the previous, plainer
 * version of this page used.
 *
 * The constrained fields (temperature, spin, programme, colour group,
 * iron setting) can't produce an invalid value through this UI at all —
 * the chips only ever offer valid ones. `instructionsFromRows` still
 * validates on Save regardless; it's the single source of truth for
 * what's valid, not duplicated here.
 */
function ChartCards({
  rows,
  machine,
  onChange,
}: {
  rows: Row[];
  machine: Machine;
  onChange: (index: number, key: (typeof COLUMNS)[number], value: string) => void;
}) {
  const t = useT();
  const { washer, iron } = machine;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="chart-cards">
      {rows.map((row, index) => {
        const set = (key: (typeof COLUMNS)[number], value: string) => onChange(index, key, value);
        const ironing = row.ironing === "yes";
        const position = washer.programs.indexOf(row.program);
        const off = washer.programs[0] ?? "";
        const setting = iron.settings.find((s) => s.key === row.iron_setting);

        return (
          <article
            // biome-ignore lint/suspicious/noArrayIndexKey: a chart row has no id of its own, and clothing_type alone isn't guaranteed unique
            key={`${row.clothing_type}-${index}`}
            className={CHART_CARD}
          >
            <div className={CHART_CARD_HEADER}>
              <h3 className="min-w-0 flex-1">
                <input
                  className={`${TEXT_INPUT} min-w-0! truncate text-base font-bold text-ink`}
                  type="text"
                  name="clothing_type"
                  aria-label={t("common.pile")}
                  value={row.clothing_type}
                  onChange={(event) => set("clothing_type", event.target.value)}
                />
              </h3>
              <DurationField
                value={row.duration}
                name="duration"
                rowId={index}
                onChange={(value) => set("duration", value)}
              />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <PillToggle
                on={row.fabric_softener === "yes"}
                onLabel={t("common.softenerOk")}
                offLabel={t("common.noSoftener")}
                name="fabric_softener"
                onClick={() => set("fabric_softener", row.fabric_softener === "yes" ? "no" : "yes")}
              />
              <span className="text-xs font-bold text-ink">
                {row.program} {row.temperature === "koud" ? "koud" : `${row.temperature} °C`} ·{" "}
                {row.spin === "0" ? t("common.noSpin") : `${row.spin} rpm`}
              </span>
            </div>

            <div className={`flex gap-3 ${SUB_PANEL}`}>
              <div className="w-20 shrink-0 text-center">
                <ProgramDial program={row.program} washer={washer} size={78} />
                <select
                  className="mt-1 w-full rounded border border-line bg-transparent px-0 text-center text-xs font-bold text-ink focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  name="program"
                  aria-label={t("common.programme")}
                  value={row.program}
                  onChange={(event) => set("program", event.target.value)}
                >
                  {washer.programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-body">{t("common.clockwiseFrom", { position, off })}</p>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <ChipSelectRow
                  label={t("common.temp")}
                  field="temperature"
                  groupName={`temperature-${index}`}
                  values={washer.temperatures}
                  selected={row.temperature}
                  onSelect={(value) => set("temperature", value)}
                />
                <ChipSelectRow
                  label={t("common.spinRpm")}
                  field="spin"
                  groupName={`spin-${index}`}
                  values={washer.spins}
                  selected={row.spin}
                  onSelect={(value) => set("spin", value)}
                />
                <ChipMultiRow
                  label={t("common.buttons")}
                  name="options"
                  values={washer.options}
                  selected={splitPipe(row.options)}
                  onToggle={(value) => {
                    const next = new Set(splitPipe(row.options));
                    if (next.has(value)) next.delete(value);
                    else next.add(value);
                    set("options", [...next].join("|"));
                  }}
                />
              </div>
            </div>

            <EditableSplitField
              label={t("common.detergent")}
              value={row.detergent}
              name="detergent"
              rowId={index}
              onChange={(value) => set("detergent", value)}
            />

            <div className="mt-3">
              <SectionHeading>{t("common.iron")}</SectionHeading>
              <div className={`flex items-center gap-3 ${SUB_PANEL}`}>
                <IronDial
                  setting={row.iron_setting}
                  settings={iron.settings}
                  off={!ironing}
                  size={62}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PillToggle
                      on={ironing}
                      onLabel={t("config.ironedLabel")}
                      offLabel={t("common.doNotIron").toUpperCase()}
                      name="ironing"
                      onClick={() => {
                        set("ironing", ironing ? "no" : "yes");
                        if (!ironing && row.iron_setting === "") {
                          set("iron_setting", iron.settings[0]?.key ?? "");
                        } else if (ironing) {
                          set("iron_setting", "");
                        }
                      }}
                    />
                    {ironing && setting && (
                      <span className="text-xs font-bold text-ink">
                        {setting.label} — {setting.detail}
                      </span>
                    )}
                  </div>
                  {ironing && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {iron.settings.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          data-testid={`chip-iron_setting-${s.key}`}
                          aria-pressed={s.key === row.iron_setting}
                          className={`${CHIP_BUTTON} ${
                            s.key === row.iron_setting ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF
                          }`}
                          onClick={() => set("iron_setting", s.key)}
                        >
                          {s.dots || s.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <ProseField
                    value={row.ironing_notes}
                    name="ironing_notes"
                    onChange={(value) => set("ironing_notes", value)}
                    ariaLabel={t("config.ironingNotesAriaLabel")}
                  />
                </div>
              </div>
            </div>

            <EditableSplitField
              label={t("sheet.dryingLabel")}
              value={row.drying}
              name="drying"
              rowId={index}
              onChange={(value) => set("drying", value)}
            />

            <div className="mt-2">
              <SectionHeading>{t("config.colourGroupHeading")}</SectionHeading>
              <div className="mt-1 flex flex-wrap gap-1">
                {colourGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    data-testid={`chip-colour_group-${group}`}
                    aria-pressed={group === row.colour_group}
                    className={`${CHIP_BUTTON} ${
                      group === row.colour_group ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF
                    }`}
                    onClick={() => set("colour_group", group)}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2">
              <SectionHeading>{t("config.mixTagsHeading")}</SectionHeading>
              <div className="mt-1 flex flex-wrap gap-1">
                {mixTags.map((tag) => {
                  const selected = splitPipe(row.mix_tags);
                  const on = selected.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      data-testid={`chip-mix_tags-${tag}`}
                      aria-pressed={on}
                      className={`${CHIP_BUTTON} ${on ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
                      onClick={() => {
                        const next = new Set(selected);
                        if (next.has(tag)) next.delete(tag);
                        else next.add(tag);
                        set("mix_tags", [...next].join("|"));
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <EditableSplitField
              label={t("common.notes")}
              value={row.notes}
              name="notes"
              rowId={index}
              onChange={(value) => set("notes", value)}
            />
            <ReferenceLink name={row.reference_name} link={row.reference_link} />
          </article>
        );
      })}
    </div>
  );
}

/**
 * A troubleshooting view — and, since #74, an editor: the whole loaded
 * config — machine and chart — in one structured place, rather than
 * reconstructed by eye from the rendered cards.
 *
 * The one place a visitor manages the whole config: uploads, downloads
 * and edits it here, machine and chart together as `@washy-washy/core`'s
 * `Config` (`customConfig.ts`) — the index page only ever displays
 * whatever's active, it carries no upload/download UI of its own.
 */
export default function ConfigViewer({ items: bundledItems, machine, locale }: Props) {
  return (
    <TranslationProvider locale={locale}>
      <ConfigViewerContent bundledItems={bundledItems} machine={machine} />
    </TranslationProvider>
  );
}

function ConfigViewerContent({
  bundledItems,
  machine,
}: {
  bundledItems: Instruction[];
  machine: Machine;
}) {
  const t = useT();
  const [customConfig, setCustomConfig] = useState<Config | null>(null);
  const [draftRows, setDraftRows] = useState<Row[]>(() => rowsFromInstructions(bundledItems));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<(typeof COLUMNS)[number] | "">("");
  const sortOptions: { value: (typeof COLUMNS)[number] | ""; label: string }[] = [
    { value: "", label: t("config.chartOrder") },
    { value: "clothing_type", label: t("common.pile") },
    { value: "detergent", label: t("common.detergent") },
    { value: "notes", label: t("common.notes") },
  ];
  // Same hydration marker SheetViewer exposes, and for the same reason: the
  // E2E suite needs a way to know React has attached before it interacts.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restored = readCustomConfig();
    setCustomConfig(restored);
    setDraftRows(rowsFromInstructions(restored?.chart ?? bundledItems));
    setHydrated(true);
    // bundledItems only, not the draft/customConfig state: this restores
    // once, the same as SheetViewer's mount effect — running it again on
    // every render would stomp an in-progress edit.
  }, [bundledItems]);

  const activeConfig = useMemo<Config>(
    () => customConfig ?? { machine, chart: bundledItems },
    [customConfig, machine, bundledItems],
  );
  const downloadHref = useMemo(
    () => `data:application/json;charset=utf-8,${encodeURIComponent(configToJson(activeConfig))}`,
    [activeConfig],
  );

  function handleCellChange(index: number, key: (typeof COLUMNS)[number], value: string) {
    setDraftRows((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  // A view-level reorder, not a mutation of draftRows itself: "no sort
  // chosen" has to mean "back to chart order," and an edit made mid-sort has
  // to land on the same row it was made on. Sorting the row's own index
  // rather than the row keeps ChartCards' onChange(index, ...) contract
  // pointed at draftRows regardless of what order the cards are drawn in.
  const sortedIndices = useMemo(() => {
    const indices = draftRows.map((_, i) => i);
    if (!sortField) return indices;
    return indices.sort((a, b) => draftRows[a][sortField].localeCompare(draftRows[b][sortField]));
  }, [draftRows, sortField]);
  const displayRows = useMemo(
    () => sortedIndices.map((i) => draftRows[i]),
    [sortedIndices, draftRows],
  );

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
      setCustomConfig(config);
      writeCustomConfig(config);
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadConfigFile(file)
      .then((config) => {
        setCustomConfig(config);
        setDraftRows(rowsFromInstructions(config.chart));
        setUploadError(null);
      })
      .catch((reason) => {
        setUploadError(reason instanceof Error ? reason.message : String(reason));
      });
  }

  function handleClear() {
    clearCustomConfig();
    setCustomConfig(null);
    setDraftRows(rowsFromInstructions(bundledItems));
    setSaveError(null);
    setUploadError(null);
  }

  return (
    <div data-hydrated={hydrated}>
      <p className="mb-1 text-sm text-body">
        {customConfig ? t("common.showingOwnConfig") : t("config.showingBundledConfig")}
      </p>
      <p className="mb-6 text-xs text-muted">{t("config.uploadEditHelp")}</p>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>{t("config.yourConfigHeading")}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex-1 sm:flex-none">
            <span className={FIELD_LABEL}>{t("common.uploadConfigJson")}</span>
            <input
              className="mt-1 block w-full text-sm text-body file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90"
              type="file"
              accept="application/json,.json"
              data-testid="page-upload-input"
              onChange={handleUpload}
            />
          </label>
          <a className={BUTTON_SECONDARY} href={downloadHref} download="washy-washy.json">
            {t("common.downloadCurrentConfig")}
          </a>
          {customConfig && (
            <button className={BUTTON_SECONDARY} type="button" onClick={handleClear}>
              {t("config.useBundledInstead")}
            </button>
          )}
        </div>
        {uploadError && (
          <p className={`${ALERT} mt-3`} role="alert">
            {t("common.couldNotUseFile", { error: uploadError })}
          </p>
        )}
      </section>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>{t("config.machineHeading")}</h2>
        <MachineSummary machine={activeConfig.machine} />
      </section>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>{t("config.chartHeading")}</h2>
        <p className="mb-3 text-xs text-body">{t("config.chartEditHelp")}</p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={FIELD_LABEL}>{t("config.sortBy")}</span>
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={t("config.sortBy")}>
            {sortOptions.map((option) => (
              <label
                key={option.value}
                className={`relative ${CHIP_BUTTON} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-1 ${sortField === option.value ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
              >
                <input
                  type="radio"
                  name="sort-by"
                  value={option.value}
                  checked={sortField === option.value}
                  onChange={() => setSortField(option.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <ChartCards
          rows={displayRows}
          machine={activeConfig.machine}
          onChange={(index, key, value) => handleCellChange(sortedIndices[index], key, value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={BUTTON_PRIMARY} onClick={handleSave}>
            {t("common.saveChanges")}
          </button>
        </div>
        {saveError && (
          <p className={`${ALERT} mt-3`} role="alert">
            {t("common.couldNotSave", { error: saveError })}
          </p>
        )}
      </section>
    </div>
  );
}
