import {
  type Config,
  configFromJson,
  type Instruction,
  type Iron,
  type IronSetting,
  instructionsFromRows,
  type Machine,
  parseMachine,
  rowsFromInstructions,
  type Washer,
} from "@washy-washy/core/browser";
import { useEffect, useState } from "react";
import { readCustomConfig, writeCustomConfig } from "../lib/customConfig";
import { slug } from "../lib/slug";
import {
  ALERT,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  FIELD_LABEL,
  SECTION_HEADING,
  TEXT_INPUT,
} from "../lib/styles";

const SECTION = "mb-6";
const ITEM_BUTTON =
  "rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-body hover:border-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

function EditableField({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={id}
        className={TEXT_INPUT}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/**
 * Add, remove and reorder — the direct replacement for a comma-separated
 * text field. A dial's programme order is meaningful (index is the angle,
 * per `Washer`'s own doc comment), so reordering is a real feature here,
 * not decoration.
 */
function StringListEditor({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...values, value]);
    setDraft("");
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= values.length) return;
    const next = values.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item as string);
    onChange(next);
  }

  return (
    <div data-testid={`list-editor-${slug(label)}`}>
      <h3 className={FIELD_LABEL}>{label}</h3>
      {/* text-body, not text-muted: muted-on-panel is 4.40:1, just under
      WCAG AA's 4.5:1 (#57) — see the same note in SheetViewer.tsx. */}
      {hint && <p className="mt-0.5 mb-1 text-xs text-body">{hint}</p>}
      <ul className="flex flex-col gap-1">
        {values.map((value, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a freeform string list has no id of its own, and a value alone isn't guaranteed unique
          <li key={`${value}-${index}`} className="flex items-center gap-1">
            <span className="flex-1 rounded border border-hairline bg-surface px-2 py-1 text-sm text-ink">
              {value}
            </span>
            <button
              type="button"
              className={ITEM_BUTTON}
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${value} up`}
            >
              ↑
            </button>
            <button
              type="button"
              className={ITEM_BUTTON}
              onClick={() => move(index, 1)}
              disabled={index === values.length - 1}
              aria-label={`Move ${value} down`}
            >
              ↓
            </button>
            <button
              type="button"
              className={ITEM_BUTTON}
              onClick={() => remove(index)}
              aria-label={`Remove ${value}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className={TEXT_INPUT}
          type="text"
          value={draft}
          placeholder={`Add a ${label.toLowerCase().replace(/s$/, "")}…`}
          aria-label={`Add to ${label}`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className={ITEM_BUTTON} onClick={add}>
          + Add
        </button>
      </div>
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
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StringListEditor
          label="Programmes"
          hint="In dial order, starting from twelve o'clock."
          values={washer.programs}
          onChange={(v) => set("programs", v)}
        />
        <StringListEditor
          label="Temperatures (°C)"
          values={washer.temperatures}
          onChange={(v) => set("temperatures", v)}
        />
        <StringListEditor
          label="Spin speeds"
          values={washer.spins}
          onChange={(v) => set("spins", v)}
        />
        <StringListEditor
          label="Buttons"
          values={washer.options}
          onChange={(v) => set("options", v)}
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
      <h3 className={`${FIELD_LABEL} mt-3`}>Settings</h3>
      {/* contain-layout (#47): overflow-x-auto alone correctly scrolls the
      table within its own bounds — confirmed, this wrapper's own box was
      already the right width — but a <table> wider than its ancestor
      still leaks into document.documentElement.scrollWidth regardless,
      forcing the whole page to scroll horizontally. contain: layout
      stops that leak without changing the scroll behaviour itself.
      Below sm: this table is hidden entirely (#102) in favour of the
      stacked cards below — dragging sideways through a 512px table on
      a phone is worse than the scroll this already fixed. Both copies
      share one data-testid-scoped locator each so a test never has to
      guess which markup is actually on screen at a given viewport. */}
      <div
        data-testid="iron-settings-table"
        className="mt-1 hidden overflow-x-auto contain-layout sm:block"
      >
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
                    className={TEXT_INPUT}
                    aria-label={`Setting ${index + 1} label`}
                    type="text"
                    value={setting.label}
                    onChange={(event) => setSetting(index, { label: event.target.value })}
                  />
                </td>
                <td className="py-1 pr-3">
                  <input
                    className={`${TEXT_INPUT} w-16`}
                    aria-label={`Setting ${index + 1} dots`}
                    type="text"
                    value={setting.dots}
                    onChange={(event) => setSetting(index, { dots: event.target.value })}
                  />
                </td>
                <td className="py-1 pr-3">
                  <input
                    className={TEXT_INPUT}
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
                    className="rounded border border-line px-1.5 py-0.5 text-xs text-body hover:border-no hover:text-no-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

      {/* The same fields and the same handlers as the table above, stacked
      instead of laid out sideways (#102) — a rendering change only, so
      this reuses setSetting/removeSetting rather than any state of its
      own. Hidden from sm: up, where the table takes over. */}
      <div data-testid="iron-settings-cards" className="mt-1 flex flex-col gap-3 sm:hidden">
        {iron.settings.map((setting, index) => (
          <div key={setting.key} className="rounded-md border border-hairline p-3">
            <div className="flex flex-col gap-2">
              <div>
                <span className={FIELD_LABEL}>Setting</span>
                <input
                  className={`${TEXT_INPUT} mt-1`}
                  aria-label={`Setting ${index + 1} label`}
                  type="text"
                  value={setting.label}
                  onChange={(event) => setSetting(index, { label: event.target.value })}
                />
              </div>
              <div>
                <span className={FIELD_LABEL}>Dots</span>
                <input
                  className={`${TEXT_INPUT} mt-1`}
                  aria-label={`Setting ${index + 1} dots`}
                  type="text"
                  value={setting.dots}
                  onChange={(event) => setSetting(index, { dots: event.target.value })}
                />
              </div>
              <div>
                <span className={FIELD_LABEL}>Detail</span>
                <input
                  className={`${TEXT_INPUT} mt-1`}
                  aria-label={`Setting ${index + 1} detail`}
                  type="text"
                  value={setting.detail}
                  onChange={(event) => setSetting(index, { detail: event.target.value })}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-body">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    aria-label={`Setting ${index + 1} makes steam`}
                    checked={setting.steam}
                    onChange={(event) => setSetting(index, { steam: event.target.checked })}
                  />
                  Steam
                </span>
                <button
                  type="button"
                  className="rounded border border-line px-1.5 py-0.5 text-xs text-body hover:border-no hover:text-no-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={() => removeSetting(index)}
                  aria-label={`Remove setting ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
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

interface Props {
  items: Instruction[];
  machine: Machine;
}

/**
 * The washer and iron, on their own page — split out of the config page
 * (#30) so machine setup isn't lost among fifteen-per-pile chart cards.
 * Reads and writes the same combined `Config` `/config` does
 * (`customConfig.ts`); editing here and clicking away without Save loses
 * the edit, the same way `/config`'s own chart editor already works — no
 * new inconsistency, just the existing app-wide pattern applied here too.
 */
export default function MachineEditor({ items: bundledItems, machine: bundledMachine }: Props) {
  const [customConfig, setCustomConfig] = useState<Config | null>(null);
  const [draftWasher, setDraftWasher] = useState<Washer>(bundledMachine.washer);
  const [draftIron, setDraftIron] = useState<Iron>(bundledMachine.iron);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restored = readCustomConfig();
    setCustomConfig(restored);
    setDraftWasher(restored?.machine.washer ?? bundledMachine.washer);
    setDraftIron(restored?.machine.iron ?? bundledMachine.iron);
    setHydrated(true);
  }, [bundledMachine]);

  function currentChart(): Instruction[] {
    return customConfig?.chart ?? bundledItems;
  }

  // A customConfig can exist purely to preserve a customised chart after
  // handleResetMachine — that's not "your own machine" any more, so this
  // compares the machine itself, not just whether any customConfig exists.
  const machineIsCustom =
    customConfig != null && JSON.stringify(customConfig.machine) !== JSON.stringify(bundledMachine);

  function handleSave() {
    try {
      // Validated together, same as /config's own Save: an edit that
      // breaks the active chart (a removed programme a row still uses) is
      // named by row and column, not a silent inconsistency.
      const candidateMachine = parseMachine({ washer: draftWasher, iron: draftIron });
      const chart = instructionsFromRows(rowsFromInstructions(currentChart()), candidateMachine);
      const config: Config = { machine: candidateMachine, chart };
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
        writeCustomConfig(config);
        setUploadError(null);
      })
      .catch((reason) => {
        setUploadError(reason instanceof Error ? reason.message : String(reason));
      });
  }

  function handleResetMachine() {
    // Scoped to the machine only — preserves whatever chart is active
    // rather than clearing the whole config the way /config's "Use the
    // bundled example instead" does.
    const config: Config = { machine: bundledMachine, chart: currentChart() };
    setCustomConfig(config);
    setDraftWasher(bundledMachine.washer);
    setDraftIron(bundledMachine.iron);
    writeCustomConfig(config);
    setSaveError(null);
    setUploadError(null);
  }

  return (
    <div data-hydrated={hydrated}>
      <p className="mb-1 text-sm text-body">
        {machineIsCustom
          ? "Showing your own machine."
          : "Showing the bundled example machine. It's a generic washer and iron, not your own."}
      </p>
      <p className="mb-6 text-xs text-muted">
        Changes apply across the whole site once saved — the same config{" "}
        <a
          href="/config"
          className="underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent"
        >
          the washing loads page
        </a>{" "}
        reads.
      </p>

      <section className={SECTION}>
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
          {machineIsCustom && (
            <button className={BUTTON_SECONDARY} type="button" onClick={handleResetMachine}>
              Use the bundled machine instead
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
        <h2 className={SECTION_HEADING}>Washer</h2>
        <WasherEditor washer={draftWasher} onChange={setDraftWasher} />
      </section>

      <section className={SECTION}>
        <h2 className={SECTION_HEADING}>Iron</h2>
        <IronEditor iron={draftIron} onChange={setDraftIron} />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={BUTTON_PRIMARY} onClick={handleSave}>
          Save changes
        </button>
      </div>
      {saveError && (
        <p className={`${ALERT} mt-3`} role="alert">
          Could not save: {saveError}
        </p>
      )}
    </div>
  );
}
