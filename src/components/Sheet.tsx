import {
  canMix,
  cardGroups,
  durationsOf,
  formatTemperature,
  ironGroups,
  ironSetting,
  ironSettingKeys,
  loadGroups,
  type Machine,
  type ResolvedInstruction,
  type Variant,
  washGroups,
} from "@washy-washy/core/browser";
import { useState } from "react";
import { useT } from "../i18n/TranslationProvider";
import { CHART_CARD, CHART_CARD_HEADER, LINK } from "../lib/styles";
import { IronDial, ProgramDial } from "./dials";
import SectionHeading from "./SectionHeading";

/** What makes an ironing card unique — see `packages/pdf`'s `documents.tsx`. */
function ironCardKey(item: ResolvedInstruction): string {
  return item.ironing ? item.ironSetting : "do-not-iron";
}

function sheetGroups(
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

// `variant`, not a pre-translated `subtitle` string: `t()` needs to run
// inside a component React actually renders through JSX, not one called as
// a plain function — test/sheet-render.test.ts's own `render()` helper
// invokes the top-level `Sheet` export directly (`Sheet({...})`, not
// `<Sheet ... />`), which never enters React's render loop, so any hook
// called there — including this file's own top-level `Sheet` — throws.
// Every hook call in this file has to live in a component reached via JSX.
function Masthead({ machine, variant }: { machine: Machine; variant: Variant }) {
  const t = useT();
  return (
    <header className="mb-4">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{t("sheet.washingInstructions")}</h2>
      <p className="mt-1 text-sm text-muted">{t(SUBTITLE_KEY[variant])}</p>
      <p className="text-sm text-muted">
        {machine.washer.name}, {machine.washer.capacity} · {machine.iron.name}
      </p>
    </header>
  );
}

function Loads({ items }: { items: ResolvedInstruction[] }) {
  const t = useT();
  const groups = loadGroups(items);

  return (
    <section className="mb-4">
      <SectionHeading>{t("sheet.loadsHeading")}</SectionHeading>
      <p className="mb-2 text-xs text-muted">{t("sheet.loadsExplain")}</p>
      <div className="rounded-md border border-hairline px-3">
        {groups.map((group, index) => {
          const first = group[0] as ResolvedInstruction;
          return (
            <div
              key={first.clothingType}
              className={`flex items-start gap-2 py-2 ${
                index === groups.length - 1 ? "" : "border-b border-hairline"
              }`}
            >
              <span className="w-18 shrink-0 text-xs font-bold text-accent-text">
                {first.program} {formatTemperature(first.temperature)}
              </span>
              <span className="flex-1 text-sm text-body">
                {group.map((item) => item.clothingType).join("  +  ")}
                {group.length > 1 && (
                  <span className="ml-1.5 rounded bg-accent-soft px-1 py-0.5 text-xs font-bold tracking-wide text-accent-text">
                    {t("sheet.together")}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted">{durationsOf(group)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Legend({ machine, variant }: { machine: Machine; variant: Variant }) {
  const t = useT();
  const { washer } = machine;
  const off = washer.programs[0] ?? "";
  const example = washer.programs[1] ?? off;
  const hottest = machine.iron.settings[machine.iron.settings.length - 1]?.key ?? "";

  return (
    <div className="mb-4 flex items-center gap-3 rounded-md bg-panel p-3">
      <div className="w-18 shrink-0 text-center">
        {variant === "iron" ? (
          <IronDial setting={hottest} settings={machine.iron.settings} size={54} />
        ) : (
          <ProgramDial program={example} washer={washer} size={54} />
        )}
        <p className="mt-1 text-xs text-body">
          {variant === "iron"
            ? t("sheet.legendThermostatCaption")
            : t("sheet.legendProgrammeCaption")}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-body">
        {variant === "iron" ? (
          t("sheet.legendIronExplain")
        ) : (
          <>
            {t("sheet.legendWashExplain", { off })}
            {variant === "full" && t("sheet.legendWashExplainFullSuffix")}
          </>
        )}
      </p>
    </div>
  );
}

function ChipRow({
  label,
  values,
  selected,
}: {
  label: string;
  values: readonly string[];
  selected: readonly string[];
}) {
  return (
    <div className="mb-1 flex items-start gap-2">
      <span className="w-14 shrink-0 pt-0.5 text-xs text-body">{label}</span>
      <div className="flex flex-wrap gap-1">
        {values.map((value) => {
          const on = selected.includes(value);
          return (
            <span
              key={value}
              className={`rounded border px-1.5 py-0.5 text-xs ${
                on
                  ? "border-accent bg-accent font-bold text-white"
                  : "border-hairline bg-surface text-muted"
              }`}
            >
              {value}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ControlPanel({ item, machine }: { item: ResolvedInstruction; machine: Machine }) {
  const t = useT();
  const { washer } = machine;
  const position = washer.programs.indexOf(item.program);
  const off = washer.programs[0] ?? "";

  return (
    <div className="flex gap-3 rounded-md border border-hairline bg-panel p-3">
      <div className="w-20 shrink-0 text-center">
        <ProgramDial program={item.program} washer={washer} size={78} />
        <p className="mt-1 text-xs font-bold text-ink">{item.program}</p>
        <p className="text-xs text-body">{t("common.clockwiseFrom", { position, off })}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <ChipRow
          label={t("common.temp")}
          values={washer.temperatures}
          selected={[item.temperature]}
        />
        <ChipRow label={t("common.spinRpm")} values={washer.spins} selected={[item.spin]} />
        <ChipRow label={t("common.buttons")} values={washer.options} selected={item.options} />
      </div>
    </div>
  );
}

function IronPanel({ items, machine }: { items: ResolvedInstruction[]; machine: Machine }) {
  const t = useT();
  const item = items[0] as ResolvedInstruction;
  const setting = item.ironing ? ironSetting(machine, item.ironSetting) : undefined;

  return (
    <div className="flex items-center gap-3 rounded-md border border-hairline bg-panel p-3">
      <IronDial
        setting={item.ironSetting}
        settings={machine.iron.settings}
        off={!item.ironing}
        size={62}
      />
      <div className="flex-1">
        <p className="text-sm font-bold text-ink">
          {setting ? `${setting.label} — ${setting.detail}` : t("common.doNotIron")}
        </p>
        {setting && (
          <p className="mt-0.5 text-xs text-body">
            {setting.steam ? t("common.insideSteamZone") : t("common.belowSteamZone")}
          </p>
        )}
        <Prose items={items} pick={(entry) => entry.ironingNotes} className="mt-1" />
      </div>
    </div>
  );
}

function Prose({
  items,
  pick,
  emphasis = false,
  className = "",
}: {
  items: ResolvedInstruction[];
  pick: (item: ResolvedInstruction) => string;
  emphasis?: boolean;
  className?: string;
}) {
  const values = items.map(pick);
  const textClass = `text-sm leading-relaxed ${emphasis ? "font-bold text-ink" : "text-body"}`;

  if (values.every((value) => value === "")) return null;

  if (values.every((value) => value === values[0])) {
    return <p className={`${textClass} ${className}`}>{values[0]}</p>;
  }

  const speaking = items.filter((_, index) => values[index] !== "");

  return (
    <div className={className}>
      {speaking.map((item, index) => (
        <p key={item.clothingType} className={`${textClass} ${index === 0 ? "" : "mt-0.5"}`}>
          <span className="font-bold text-ink">{item.clothingType}: </span>
          {pick(item)}
        </p>
      ))}
    </div>
  );
}

function SplitField({
  label,
  items,
  pick,
  emphasis = false,
}: {
  label: string;
  items: ResolvedInstruction[];
  pick: (item: ResolvedInstruction) => string;
  emphasis?: boolean;
}) {
  if (items.every((item) => pick(item) === "")) return null;

  return (
    <div className="mt-2">
      {/* Not <SectionHeading> (#94): its own mb-1 has no margin to
      collapse with here — Prose's <p> carries no mt-* — so it would add
      a real 4px gap that isn't there today. */}
      <p className="text-xs font-bold tracking-wide text-muted">{label.toUpperCase()}</p>
      <Prose items={items} pick={pick} emphasis={emphasis} />
    </div>
  );
}

/**
 * Where a washing instruction came from, when a row cites one — a
 * manufacturer's own guidance, a care label, a trade source. Hidden
 * entirely when nothing in the group cites anything (#79); a group can
 * mix cited and uncited members, so each cited member gets its own line
 * rather than picking one to speak for the whole card.
 */
function ReferenceField({ items }: { items: ResolvedInstruction[] }) {
  const t = useT();
  const cited = items.filter((item) => item.referenceName !== "");
  if (cited.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-bold tracking-wide text-muted">{t("common.source")}</p>
      {cited.map((item, index) => (
        <p
          key={item.clothingType}
          className={`text-sm leading-relaxed text-body ${index === 0 ? "" : "mt-0.5"}`}
        >
          {items.length > 1 && <span className="font-bold text-ink">{item.clothingType}: </span>}
          {item.referenceLink !== "" ? (
            <a href={item.referenceLink} target="_blank" rel="noopener noreferrer" className={LINK}>
              {item.referenceName}
            </a>
          ) : (
            item.referenceName
          )}
        </p>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="mt-2">
      {/* Not <SectionHeading> — same reason as SplitField above (#94). */}
      <p className="text-xs font-bold tracking-wide text-muted">{label.toUpperCase()}</p>
      <p className={`text-sm leading-relaxed ${emphasis ? "font-bold text-ink" : "text-body"}`}>
        {value}
      </p>
    </div>
  );
}

function SoftenerBadge({ on }: { on: boolean }) {
  const t = useT();
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${on ? "bg-yes" : "bg-no"}`}
    >
      {on ? t("common.softenerOk") : t("common.noSoftener")}
    </span>
  );
}

const CARD_ACTION =
  "rounded border border-line bg-surface px-1.5 py-0.5 text-xs font-semibold text-body hover:border-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Download and share for a single card — the pile(s) it draws, not the
 * whole sheet. The actual work (rendering a PDF, touching `window`/
 * `navigator`) lives in `SheetViewer` and arrives as callbacks: this file
 * is imported directly by `test/sheet-render.test.ts` under a Bun-only
 * tsconfig with no DOM lib, so it can never reference `window`,
 * `document` or `navigator` itself. Only the downloading/error/copied
 * state — which needs no DOM types — lives here.
 */
function CardActions({
  group,
  onDownload,
  onShare,
}: {
  group: ResolvedInstruction[];
  onDownload: (group: ResolvedInstruction[]) => Promise<string[]>;
  onShare: (group: ResolvedInstruction[]) => Promise<void>;
}) {
  const t = useT();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropped, setDropped] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    setDropped([]);
    try {
      setDropped(await onDownload(group));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    setShareError(null);
    try {
      await onShare(group);
      setCopied(true);
      // The button's own label swap ("Copy link" -> "Copied!") is the
      // visible feedback — whether assistive tech announces a label
      // change on the focused control is implementation-defined, so
      // this sr-only region carries the actual announcement (#55).
      setShareStatus(t("common.copied"));
      setTimeout(() => {
        setCopied(false);
        setShareStatus("");
      }, 2000);
    } catch (reason) {
      setShareError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex shrink-0 gap-1.5">
        <button type="button" className={CARD_ACTION} onClick={handleShare}>
          {copied ? t("common.copied") : t("sheet.copyLink")}
        </button>
        <button
          type="button"
          className={CARD_ACTION}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? t("sheet.preparing") : t("sheet.download")}
        </button>
      </div>
      <p aria-live="polite" role="status" className="sr-only">
        {shareStatus}
      </p>
      {shareError && (
        <p className="text-right text-xs text-no-text" role="alert">
          {t("sheet.couldNotCopyLink", { error: shareError })}
        </p>
      )}
      {error && (
        <p className="text-right text-xs text-no-text" role="alert">
          {t("sheet.couldNotGeneratePdf", { error })}
        </p>
      )}
      {dropped.length > 0 && (
        <p className="text-right text-xs text-muted" role="status">
          {t("sheet.couldntRenderInPdf", { chars: dropped.join(" ") })}
        </p>
      )}
    </div>
  );
}

function Card({
  group,
  index,
  variant,
  machine,
  onDownloadCard,
  onShareCard,
}: {
  group: ResolvedInstruction[];
  index: number;
  variant: Variant;
  machine: Machine;
  onDownloadCard?: (group: ResolvedInstruction[]) => Promise<string[]>;
  onShareCard?: (group: ResolvedInstruction[]) => Promise<void>;
}) {
  const t = useT();
  const item = group[0] as ResolvedInstruction;
  const heading = group.map((member) => member.clothingType).join(" + ");
  const names = new Set(group.map((member) => member.clothingType));
  const together = group.every((a) => group.every((b) => a === b || canMix(a, b)));
  const alsoWith = item.mixesWith.filter(
    (name) => !names.has(name) && group.every((member) => member.mixesWith.includes(name)),
  );

  return (
    <article className={CHART_CARD}>
      <div className={CHART_CARD_HEADER}>
        <h3 className="text-base font-bold text-ink">
          {index}. {heading}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-bold text-accent-text">{durationsOf(group)}</span>
          {onDownloadCard && onShareCard && (
            <CardActions group={group} onDownload={onDownloadCard} onShare={onShareCard} />
          )}
        </div>
      </div>

      <SectionHeading>{t("sheet.washHeading")}</SectionHeading>
      <div className="mb-3 flex items-center gap-2">
        <SoftenerBadge on={item.fabricSoftener} />
        <span className="text-xs font-bold text-ink">
          {item.program} {item.temperature === "koud" ? "koud" : `${item.temperature} °C`} ·{" "}
          {item.spin === "0" ? t("common.noSpin") : `${item.spin} rpm`}
        </span>
      </div>

      <ControlPanel item={item} machine={machine} />

      <SplitField label={t("common.detergent")} items={group} pick={(member) => member.detergent} />
      <Field
        label={t("sheet.washTogetherWithLabel")}
        value={
          group.length > 1 && together
            ? alsoWith.length > 0
              ? t("sheet.washTogetherEachOtherAnd", { names: alsoWith.join(", ") })
              : t("sheet.washTogetherEachOther")
            : group.length > 1
              ? t("sheet.washSeparately")
              : alsoWith.length > 0
                ? alsoWith.join(", ")
                : t("sheet.washAlone")
        }
        emphasis
      />
      <SplitField label={t("sheet.dryingLabel")} items={group} pick={(member) => member.drying} />

      {variant !== "wash" && (
        <div className="mt-3">
          <SectionHeading>{t("common.iron")}</SectionHeading>
          <IronPanel items={group} machine={machine} />
        </div>
      )}

      <SplitField label={t("common.notes")} items={group} pick={(member) => member.notes} />
      <ReferenceField items={group} />
    </article>
  );
}

function IronCard({
  group,
  index,
  machine,
}: {
  group: ResolvedInstruction[];
  index: number;
  machine: Machine;
}) {
  const t = useT();
  const item = group[0] as ResolvedInstruction;
  const setting = item.ironing ? ironSetting(machine, item.ironSetting) : undefined;

  return (
    <article className={CHART_CARD}>
      <div className={CHART_CARD_HEADER}>
        <h3 className="text-base font-bold text-ink">
          {index}. {setting ? `${setting.label} — ${setting.detail}` : t("common.doNotIron")}
        </h3>
        <span className="shrink-0 text-xs text-muted">
          {group.length === 1
            ? t("sheet.pileCountOne", { count: group.length })
            : t("sheet.pileCountOther", { count: group.length })}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-md border border-hairline bg-panel p-3">
        <IronDial
          setting={item.ironSetting}
          settings={machine.iron.settings}
          off={!item.ironing}
          size={62}
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">
            {setting ? t("sheet.thermostatOn", { label: setting.label }) : t("sheet.leaveIronOff")}
          </p>
          <p className="mt-0.5 text-xs text-body">
            {setting
              ? setting.steam
                ? t("common.insideSteamZone")
                : t("common.belowSteamZone")
              : t("sheet.neverNearBoard")}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <SectionHeading>
          {setting ? t("sheet.howHeading") : t("sheet.neverTheseHeading")}
        </SectionHeading>
        {group.map((member) => (
          <div key={member.clothingType} className="mt-1 flex items-start gap-2">
            <span className="w-26 shrink-0 text-xs font-bold text-ink">{member.clothingType}</span>
            <span className="text-xs text-body">{member.ironingNotes}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

interface Props {
  items: ResolvedInstruction[];
  machine: Machine;
  variant: Variant;
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
 */
function DurationsDisclaimer() {
  const t = useT();
  return (
    <p className="mt-3 text-center text-xs text-muted italic">{t("sheet.durationsDisclaimer")}</p>
  );
}

export default function Sheet({ items, machine, variant, onDownloadCard, onShareCard }: Props) {
  const groups = sheetGroups(items, machine, variant);

  return (
    <div>
      <Masthead machine={machine} variant={variant} />
      {variant !== "iron" && <Loads items={items} />}
      <Legend machine={machine} variant={variant} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {groups.map((group, index) =>
          variant === "iron" ? (
            <IronCard
              key={ironCardKey(group[0] as ResolvedInstruction)}
              group={group}
              index={index + 1}
              machine={machine}
            />
          ) : (
            <Card
              key={(group[0] as ResolvedInstruction).clothingType}
              group={group}
              index={index + 1}
              variant={variant}
              machine={machine}
              onDownloadCard={onDownloadCard}
              onShareCard={onShareCard}
            />
          ),
        )}
      </div>
      {variant !== "iron" && <DurationsDisclaimer />}
    </div>
  );
}

// Re-exported for tests that want the raw grouping without pulling in the
// whole component.
export { ironCardKey, sheetGroups };
