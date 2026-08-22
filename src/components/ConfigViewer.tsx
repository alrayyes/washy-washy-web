import {
  type COLUMNS,
  type Config,
  colourGroups,
  configFromJson,
  configToJson,
  type Instruction,
  type Iron,
  type IronSetting,
  instructionsFromRows,
  type Machine,
  mixTags,
  parseMachine,
  type Row,
  rowsFromInstructions,
  type Washer,
} from "@washy-washy/core/browser";
import { useEffect, useMemo, useState } from "react";
import { clearCustomConfig, readCustomConfig, writeCustomConfig } from "../lib/customConfig";
import { slug } from "../lib/slug";
import { colour } from "../lib/theme";
import { IronDial, ProgramDial } from "./dials";

const SECTION = "mb-6";
const SECTION_HEADING = "mb-2 text-lg font-bold text-ink";
const CARD = "rounded-lg border border-hairline bg-panel p-4";
const FIELD_LABEL = "text-xs font-semibold tracking-wide text-body uppercase";
const TEXT_INPUT =
  "w-full min-w-[8rem] rounded border border-transparent bg-transparent px-1 py-0.5 text-body hover:border-line focus:border-accent focus:bg-white focus:outline-none";
const BUTTON_PRIMARY =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
const BUTTON_SECONDARY =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
const ALERT = "rounded-md border border-no/30 bg-no/5 px-3 py-2 text-sm text-no";

// Matches Sheet.tsx's read-only card exactly (CARD_CLASS/CARD_HEADER_CLASS
// there) — white, not the gray `CARD` panel above, which is this page's own
// machine-summary boxes, a different thing.
const CHART_CARD = "rounded-lg border border-line p-4";
const CHART_CARD_HEADER = "mb-3 flex items-center justify-between gap-2 border-b border-ink pb-1.5";
const SUB_PANEL = "rounded-md border border-hairline bg-panel p-3";
const CHIP_BUTTON = "rounded border px-1.5 py-0.5 text-xs";
const CHIP_BUTTON_ON = "border-accent bg-accent font-bold text-white";
const CHIP_BUTTON_OFF = "border-hairline bg-white text-muted hover:border-line";
const PILL_BUTTON = "rounded px-1.5 py-0.5 text-xs font-bold text-white";

interface Props {
  items: Instruction[];
  machine: Machine;
}

/** Every field is a plain string (`Row`'s shape), so alphabetical sort just works. */
const SORT_FIELDS: { value: (typeof COLUMNS)[number]; label: string }[] = [
  { value: "clothing_type", label: "Pile" },
  { value: "detergent", label: "Detergent" },
  { value: "notes", label: "Notes" },
];

/** Matches Sheet.tsx's `SectionHeading` exactly. */
function SectionHeading({ children }: { children: string }) {
  return (
    <p className="mb-1 text-[0.7rem] font-bold tracking-wide text-muted">
      {children.toUpperCase()}
    </p>
  );
}

/** Comma-separated, in order — matches how a dial's positions read naturally, and lets a visitor add/remove/reorder all at once instead of one item at a time. */
function splitComma(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function EditableField({
  label,
  id,
  value,
  hint,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={id}
        className={`${TEXT_INPUT} border-line`}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-[0.65rem] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

function WasherEditor({
  washer,
  onChange,
}: {
  washer: Washer;
  onChange: (washer: Washer) => void;
}) {
  function set<K extends keyof Washer>(key: K, value: Washer[K]) {
    onChange({ ...washer, [key]: value });
  }

  return (
    <div className={CARD}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EditableField
          label="Name"
          id="washer-name"
          value={washer.name}
          onChange={(v) => set("name", v)}
        />
        <EditableField
          label="Capacity"
          id="washer-capacity"
          value={washer.capacity}
          onChange={(v) => set("capacity", v)}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EditableField
          label="Programmes"
          id="washer-programs"
          hint="Comma-separated, in dial order starting from twelve o'clock."
          value={washer.programs.join(", ")}
          onChange={(v) => set("programs", splitComma(v))}
        />
        <EditableField
          label="Temperatures"
          id="washer-temperatures"
          hint="Comma-separated."
          value={washer.temperatures.join(", ")}
          onChange={(v) => set("temperatures", splitComma(v))}
        />
        <EditableField
          label="Spin speeds"
          id="washer-spins"
          hint="Comma-separated."
          value={washer.spins.join(", ")}
          onChange={(v) => set("spins", splitComma(v))}
        />
        <EditableField
          label="Buttons"
          id="washer-options"
          hint="Comma-separated."
          value={washer.options.join(", ")}
          onChange={(v) => set("options", splitComma(v))}
        />
      </div>
    </div>
  );
}

function IronEditor({ iron, onChange }: { iron: Iron; onChange: (iron: Iron) => void }) {
  function setSetting(index: number, patch: Partial<IronSetting>) {
    onChange({
      ...iron,
      settings: iron.settings.map((setting, i) =>
        i === index
          ? { ...setting, ...patch, key: patch.label ? slug(patch.label) : setting.key }
          : setting,
      ),
    });
  }

  function addSetting() {
    onChange({
      ...iron,
      settings: [
        ...iron.settings,
        {
          key: `setting-${iron.settings.length + 1}`,
          dots: "•",
          label: "New setting",
          detail: "",
          steam: false,
        },
      ],
    });
  }

  function removeSetting(index: number) {
    onChange({ ...iron, settings: iron.settings.filter((_, i) => i !== index) });
  }

  return (
    <div className={CARD}>
      <EditableField
        label="Name"
        id="iron-name"
        value={iron.name}
        onChange={(v) => onChange({ ...iron, name: v })}
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-body uppercase">
              <th className="py-1 pr-3 font-semibold">Setting</th>
              <th className="py-1 pr-3 font-semibold">Dots</th>
              <th className="py-1 pr-3 font-semibold">Detail</th>
              <th className="py-1 pr-3 font-semibold">Steam</th>
              <th className="py-1 font-semibold">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {iron.settings.map((setting, index) => (
              <tr key={setting.key} className="border-b border-hairline last:border-0">
                <td className="py-1 pr-3">
                  <input
                    className={`${TEXT_INPUT} border-line`}
                    aria-label={`Setting ${index + 1} label`}
                    type="text"
                    value={setting.label}
                    onChange={(event) => setSetting(index, { label: event.target.value })}
                  />
                </td>
                <td className="py-1 pr-3">
                  <input
                    className={`${TEXT_INPUT} w-16 border-line`}
                    aria-label={`Setting ${index + 1} dots`}
                    type="text"
                    value={setting.dots}
                    onChange={(event) => setSetting(index, { dots: event.target.value })}
                  />
                </td>
                <td className="py-1 pr-3">
                  <input
                    className={`${TEXT_INPUT} border-line`}
                    aria-label={`Setting ${index + 1} detail`}
                    type="text"
                    value={setting.detail}
                    onChange={(event) => setSetting(index, { detail: event.target.value })}
                  />
                </td>
                <td className="py-1 pr-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    aria-label={`Setting ${index + 1} makes steam`}
                    checked={setting.steam}
                    onChange={(event) => setSetting(index, { steam: event.target.checked })}
                  />
                </td>
                <td className="py-1">
                  <button
                    type="button"
                    className="rounded border border-line px-1.5 py-0.5 text-xs text-body hover:border-no hover:text-no focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    onClick={() => removeSetting(index)}
                    aria-label={`Remove setting ${index + 1}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="mt-2 rounded border border-line px-2 py-1 text-xs font-semibold text-body hover:border-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={addSetting}
      >
        + Add setting
      </button>
    </div>
  );
}

/** "~2:30" -> "02:30" for `<input type="time">`; unparsable/empty -> "". */
function toTimeValue(duration: string): string {
  const match = duration.match(/(\d+):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

/** The reverse of `toTimeValue` — always writes back the "~H:MM" shape every duration in this app already uses. */
function fromTimeValue(value: string): string {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  return `~${Number(hours)}:${minutes}`;
}

function splitPipe(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

const SELECT_INPUT = `${TEXT_INPUT} bg-white`;

function ProseField({
  value,
  name,
  onChange,
}: {
  value: string;
  name: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      className={`${TEXT_INPUT} resize-none`}
      rows={2}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/**
 * The clickable version of Sheet.tsx's read-only `ChipRow` — same look
 * (selected: filled accent, unselected: outlined), but every chip is a
 * button that sets the field to its own value, single-select.
 */
function ChipSelectRow({
  label,
  name,
  values,
  selected,
  onSelect,
}: {
  label: string;
  name: string;
  values: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mb-1 flex items-start gap-2">
      <span className="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={label}>
        {values.map((value) => (
          <button
            key={value}
            type="button"
            data-testid={`chip-${name}-${value}`}
            aria-pressed={value === selected}
            className={`${CHIP_BUTTON} ${value === selected ? CHIP_BUTTON_ON : CHIP_BUTTON_OFF}`}
            onClick={() => onSelect(value)}
          >
            {value}
          </button>
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
      className={PILL_BUTTON}
      style={{ backgroundColor: on ? colour.yes : colour.no }}
      onClick={onClick}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

function TimeField({
  value,
  name,
  onChange,
}: {
  value: string;
  name: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span aria-hidden="true" className="text-body">
        ~
      </span>
      <input
        className={SELECT_INPUT}
        type="time"
        name={name}
        value={toTimeValue(value)}
        onChange={(event) => onChange(fromTimeValue(event.target.value))}
      />
    </div>
  );
}

function EditableSplitField({
  label,
  value,
  name,
  onChange,
}: {
  label: string;
  value: string;
  name: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-2">
      <p className="text-[0.6rem] font-bold tracking-wide text-muted">{label.toUpperCase()}</p>
      <ProseField value={value} name={name} onChange={onChange} />
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
              <input
                className={`${TEXT_INPUT} min-w-0 text-base font-bold text-ink`}
                type="text"
                name="clothing_type"
                aria-label="Pile"
                value={row.clothing_type}
                onChange={(event) => set("clothing_type", event.target.value)}
              />
              <TimeField
                value={row.duration}
                name="duration"
                onChange={(value) => set("duration", value)}
              />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <PillToggle
                on={row.fabric_softener === "yes"}
                onLabel="SOFTENER OK"
                offLabel="NO SOFTENER"
                name="fabric_softener"
                onClick={() => set("fabric_softener", row.fabric_softener === "yes" ? "no" : "yes")}
              />
              <span className="text-xs font-bold text-ink">
                {row.program} {row.temperature === "koud" ? "koud" : `${row.temperature} °C`} ·{" "}
                {row.spin === "0" ? "no spin" : `${row.spin} rpm`}
              </span>
            </div>

            <div className={`flex gap-3 ${SUB_PANEL}`}>
              <div className="w-20 shrink-0 text-center">
                <ProgramDial program={row.program} washer={washer} size={78} />
                <select
                  className="mt-1 w-full rounded border border-transparent bg-transparent px-0 text-center text-xs font-bold text-ink hover:border-line focus:border-accent focus:bg-white focus:outline-none"
                  name="program"
                  aria-label="Programme"
                  value={row.program}
                  onChange={(event) => set("program", event.target.value)}
                >
                  {washer.programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
                <p className="text-[0.6rem] text-body">
                  {position} clockwise from {off}
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <ChipSelectRow
                  label="Temp"
                  name="temperature"
                  values={washer.temperatures}
                  selected={row.temperature}
                  onSelect={(value) => set("temperature", value)}
                />
                <ChipSelectRow
                  label="Spin rpm"
                  name="spin"
                  values={washer.spins}
                  selected={row.spin}
                  onSelect={(value) => set("spin", value)}
                />
                <ChipMultiRow
                  label="Buttons"
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
              label="Detergent"
              value={row.detergent}
              name="detergent"
              onChange={(value) => set("detergent", value)}
            />

            <div className="mt-3">
              <SectionHeading>Iron</SectionHeading>
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
                      onLabel="IRONED"
                      offLabel="DO NOT IRON"
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
                  />
                </div>
              </div>
            </div>

            <EditableSplitField
              label="Drying"
              value={row.drying}
              name="drying"
              onChange={(value) => set("drying", value)}
            />

            <div className="mt-2">
              <p className="text-[0.6rem] font-bold tracking-wide text-muted">COLOUR GROUP</p>
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
              <p className="text-[0.6rem] font-bold tracking-wide text-muted">MIX TAGS</p>
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
              label="Notes"
              value={row.notes}
              name="notes"
              onChange={(value) => set("notes", value)}
            />
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
export default function ConfigViewer({ items: bundledItems, machine }: Props) {
  const [customConfig, setCustomConfig] = useState<Config | null>(null);
  const [draftWasher, setDraftWasher] = useState<Washer>(machine.washer);
  const [draftIron, setDraftIron] = useState<Iron>(machine.iron);
  const [draftRows, setDraftRows] = useState<Row[]>(() => rowsFromInstructions(bundledItems));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<(typeof COLUMNS)[number] | "">("");
  // Same hydration marker SheetViewer exposes, and for the same reason: the
  // E2E suite needs a way to know React has attached before it interacts.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restored = readCustomConfig();
    setCustomConfig(restored);
    setDraftWasher(restored?.machine.washer ?? machine.washer);
    setDraftIron(restored?.machine.iron ?? machine.iron);
    setDraftRows(rowsFromInstructions(restored?.chart ?? bundledItems));
    setHydrated(true);
    // machine and bundledItems only, not the draft/customConfig state:
    // this restores once, the same as SheetViewer's mount effect — running
    // it again on every render would stomp an in-progress edit.
  }, [machine, bundledItems]);

  // The machine chart rows are edited and validated against — live, not
  // just the bundled one — so adding a programme above makes it pickable
  // in a chart row's chips immediately, before Save.
  const draftMachine = useMemo<Machine>(
    () => ({ washer: draftWasher, iron: draftIron }),
    [draftWasher, draftIron],
  );

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
      // Machine and chart validated together, in that order — a machine
      // edit that breaks the chart (a removed programme a row still uses)
      // is what instructionsFromRows catches next, so the one error names
      // whichever half is actually wrong.
      const candidateMachine = parseMachine(draftMachine);
      const parsedChart = instructionsFromRows(draftRows, candidateMachine);
      const config: Config = { machine: candidateMachine, chart: parsedChart };
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

    file
      .text()
      .then((text) => {
        const config = configFromJson(text);
        setCustomConfig(config);
        setDraftWasher(config.machine.washer);
        setDraftIron(config.machine.iron);
        setDraftRows(rowsFromInstructions(config.chart));
        writeCustomConfig(config);
        setUploadError(null);
      })
      .catch((reason) => {
        setUploadError(reason instanceof Error ? reason.message : String(reason));
      });
  }

  function handleClear() {
    clearCustomConfig();
    setCustomConfig(null);
    setDraftWasher(machine.washer);
    setDraftIron(machine.iron);
    setDraftRows(rowsFromInstructions(bundledItems));
    setSaveError(null);
    setUploadError(null);
  }

  return (
    <div data-hydrated={hydrated}>
      <p className="mb-1 text-sm text-body">
        {customConfig
          ? "Showing your own config."
          : "Showing the bundled example config. It's a generic laundry chart and washing machine, not your own."}
      </p>
      <p className="mb-6 text-xs text-muted">
        Upload, download or edit below — changes apply across the whole site once saved, and persist
        in this browser until you clear them.
      </p>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>Your config</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex-1 sm:flex-none">
            <span className={FIELD_LABEL}>Upload a config (JSON)</span>
            <input
              className="mt-1 block w-full text-sm text-body file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90"
              type="file"
              accept="application/json,.json"
              onChange={handleUpload}
            />
          </label>
          <a className={BUTTON_SECONDARY} href={downloadHref} download="washy-washy.json">
            Download this config as JSON
          </a>
          {customConfig && (
            <button className={BUTTON_SECONDARY} type="button" onClick={handleClear}>
              Use the bundled example instead
            </button>
          )}
        </div>
        {uploadError && (
          <p className={`${ALERT} mt-3`} role="alert">
            Could not use that file: {uploadError}
          </p>
        )}
      </section>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>Machine</h2>
        <div className="flex flex-col gap-4">
          <WasherEditor washer={draftWasher} onChange={setDraftWasher} />
          <IronEditor iron={draftIron} onChange={setDraftIron} />
        </div>
      </section>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>Chart — every pile</h2>
        <p className="mb-3 text-xs text-body">
          Every field is editable. Save checks each row against the machine above, the same way an
          upload does — an unknown value is called out by row and column, not silently accepted.
        </p>
        <div className="mb-3 flex items-center gap-2">
          <label htmlFor="sort-by" className={FIELD_LABEL}>
            Sort by
          </label>
          <select
            id="sort-by"
            className={TEXT_INPUT}
            value={sortField}
            onChange={(event) => setSortField(event.target.value as (typeof COLUMNS)[number] | "")}
          >
            <option value="">Chart order</option>
            {SORT_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        </div>
        <ChartCards
          rows={displayRows}
          machine={draftMachine}
          onChange={(index, key, value) => handleCellChange(sortedIndices[index], key, value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={BUTTON_PRIMARY} onClick={handleSave}>
            Save changes
          </button>
        </div>
        {saveError && (
          <p className={`${ALERT} mt-3`} role="alert">
            Could not save: {saveError}
          </p>
        )}
      </section>
    </div>
  );
}
