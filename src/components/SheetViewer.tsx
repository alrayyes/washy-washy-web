import {
  formatTemperature,
  type Machine,
  type ResolvedInstruction,
  resolve,
  type Variant,
  variants,
} from "@washy-washy/core/browser";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG_HASH_PREFIX, decodeConfigHash, encodeConfigHash } from "../lib/configShare";
import { readCustomConfig, writeCustomConfig } from "../lib/customConfig";
import {
  type AdvancedFilters,
  computeFacets,
  emptyAdvancedFilters,
  facetOptions,
  filterAdvanced,
  filterByPile,
  hasActiveAdvancedFilters,
} from "../lib/filter";
import { slug } from "../lib/slug";
import { readFilters, writeFilters } from "../lib/storage";
import { ALERT, BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_LABEL } from "../lib/styles";
import { readUrlFilters } from "../lib/url";
import { writeUrlFilters } from "../lib/urlHistory";
import Sheet from "./Sheet";

const CUT_LABEL: Record<Variant, string> = {
  full: "Everything",
  wash: "Washing only",
  iron: "Ironing only",
};

const FIELD_INPUT =
  "mt-1 block w-full min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";

/**
 * A tap-to-open "?" next to a field label — `title` alone is a hover-only
 * tooltip, which a phone (this site's main device) can't reach. Closes on
 * blur so it doesn't linger once the visitor's moved on. Always a sibling
 * of the field's own `<label>`, never nested inside it — a `<button>`
 * inside a `<label>` is invalid HTML and unreliable with assistive tech.
 */
// w-48 in px, plus a little slack for the box's own border/shadow — the
// threshold this file's open handler checks available space against
// before deciding whether the tooltip needs to open from the right
// edge instead of the left (#59).
const TOOLTIP_WIDTH = 208;

function HelpBubble({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function toggleOpen() {
    setOpen((value) => {
      const next = !value;
      if (next && buttonRef.current) {
        const { left } = buttonRef.current.getBoundingClientRect();
        setAlignRight(window.innerWidth - left < TOOLTIP_WIDTH);
      }
      return next;
    });
  }

  return (
    <span className="relative inline-block normal-case">
      <button
        ref={buttonRef}
        type="button"
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-line text-xs font-bold text-body hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="What does this do?"
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onClick={toggleOpen}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute top-full z-10 mt-1 w-48 max-w-[80vw] rounded-md border border-line bg-surface p-2 text-xs font-normal text-body shadow-md ${alignRight ? "right-0" : "left-0"}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}

interface Props {
  items: ResolvedInstruction[];
  machine: Machine;
}

/**
 * The in-browser answer to `bun run generate`'s PDFs: the same chart, drawn
 * as a real page (`Sheet`) rather than an embedded PDF, filtered by cut and
 * pile instead of a filename suffix, and optionally over a chart you
 * uploaded instead of the bundled example. The PDFs themselves — the same
 * `renderPhone`/`renderPrint` the CLI uses — are only ever generated when
 * one of the two download buttons is clicked, not on every filter change
 * (#122).
 */
export default function SheetViewer({ items: bundledItems, machine: bundledMachine }: Props) {
  const [cut, setCut] = useState<Variant>("full");
  const [pileQuery, setPileQuery] = useState("");
  const [advanced, setAdvanced] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [downloadingPhone, setDownloadingPhone] = useState(false);
  const [phoneDownloadError, setPhoneDownloadError] = useState<string | null>(null);
  const [phoneDownloadDropped, setPhoneDownloadDropped] = useState<string[]>([]);
  const [downloadingPrint, setDownloadingPrint] = useState(false);
  const [printDownloadError, setPrintDownloadError] = useState<string | null>(null);
  const [printDownloadDropped, setPrintDownloadDropped] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);
  const [configHashError, setConfigHashError] = useState<string | null>(null);
  // Machine and chart together — whatever was last uploaded or edited on
  // the config page (customConfig.ts). null means "nothing active,
  // showing the bundled example," the same as before.
  const [activeMachine, setActiveMachine] = useState<Machine>(bundledMachine);
  const [customItems, setCustomItems] = useState<ResolvedInstruction[] | null>(null);
  // Read by the E2E suite (`[data-hydrated="true"]`), which otherwise has no
  // way to tell that React has attached its listeners: a `selectOption` or
  // `fill` fired at the plain server-rendered HTML still "succeeds" — it
  // mutates the DOM directly — but the change never reaches this
  // component's state, since nothing is listening yet.
  const [hydrated, setHydrated] = useState(false);

  // Restored client-side, after the first render — matching the server-
  // rendered default (the bundled chart, no filters) on that first pass
  // avoids a hydration mismatch.
  const restored = useRef(false);
  useEffect(() => {
    // A URL carrying filter state wins outright over a previous visit's
    // saved one — a shared link is meant to show what was shared, not
    // silently blend with (or lose to) whatever's already in this
    // browser's storage.
    const fromUrl = readUrlFilters(window.location.search);
    if (Object.keys(fromUrl).length > 0) {
      setCut(fromUrl.cut ?? "full");
      setPileQuery(fromUrl.pileQuery ?? "");
      setAdvanced({
        program: fromUrl.program ?? "",
        temperature: fromUrl.temperature ?? "",
        spin: fromUrl.spin ?? "",
        detergentQuery: fromUrl.detergentQuery ?? "",
      });
    } else {
      const saved = readFilters();
      if (saved) {
        setCut(saved.cut);
        setPileQuery(saved.pileQuery);
        setAdvanced({
          program: saved.program,
          temperature: saved.temperature,
          spin: saved.spin,
          detergentQuery: saved.detergentQuery,
        });
      }
    }
    // A #config=... hash wins over whatever's already saved — same
    // "what was shared is what shows" reasoning the URL filter state
    // above already follows. Async (gzip via CompressionStream), so the
    // rest of this effect's own restoration runs first, synchronously,
    // and this only overrides it if the hash actually decodes.
    async function restoreConfigFromHash(): Promise<boolean> {
      const hash = window.location.hash;
      if (!hash.startsWith(`#${CONFIG_HASH_PREFIX}`)) return false;
      try {
        const config = await decodeConfigHash(hash);
        if (!config) return false;
        setActiveMachine(config.machine);
        setCustomItems(resolve(config.chart));
        // Persists the same way an upload does — "becomes the active
        // config for that visit" means more than just this one render.
        writeCustomConfig(config);
        // Consumed: clears the (long) hash from the address bar so a
        // reload doesn't re-decode it, and so what the visitor bookmarks
        // or re-shares from here on is the short canonical URL, not the
        // one-time link they arrived on.
        history.replaceState(null, "", window.location.pathname + window.location.search);
        return true;
      } catch (reason) {
        setConfigHashError(reason instanceof Error ? reason.message : String(reason));
        return false;
      }
    }

    restoreConfigFromHash().then((restoredFromHash) => {
      if (!restoredFromHash) {
        const config = readCustomConfig();
        if (config) {
          setActiveMachine(config.machine);
          setCustomItems(resolve(config.chart));
        }
      }
      restored.current = true;
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    // Skipped on the mount render: without this, restoring a saved filter
    // above would immediately be overwritten by writing back the still-
    // default state from this same effect.
    if (!restored.current) return;
    writeFilters({ cut, pileQuery, ...advanced });
    writeUrlFilters({ cut, pileQuery, ...advanced });
  }, [cut, pileQuery, advanced]);

  const sourceItems = customItems ?? bundledItems;
  const filtered = useMemo(
    () => filterAdvanced(filterByPile(sourceItems, pileQuery), advanced),
    [sourceItems, pileQuery, advanced],
  );
  // Which Programme/Temperature/Spin values could still narrow the chart to
  // something, given the pile search and whatever else is already picked —
  // the active machine's own capability list can (and for the bundled
  // example, does) name a value no pile actually uses (#118).
  const facets = useMemo(
    () => computeFacets(sourceItems, pileQuery, advanced),
    [sourceItems, pileQuery, advanced],
  );
  const programOptions = facetOptions(
    activeMachine.washer.programs,
    facets.programs,
    advanced.program,
  );
  const temperatureOptions = facetOptions(
    activeMachine.washer.temperatures,
    facets.temperatures,
    advanced.temperature,
  );
  const spinOptions = facetOptions(activeMachine.washer.spins, facets.spins, advanced.spin);

  function savePdf(pdf: Uint8Array, filename: string) {
    // TS's DOM lib types BlobPart as ArrayBuffer-backed only, while
    // Uint8Array is typed over the wider ArrayBufferLike (which also
    // covers SharedArrayBuffer) — pdf is always a fresh copy from
    // Blob.arrayBuffer(), never shared, so this is a safe narrowing.
    const url = URL.createObjectURL(new Blob([pdf as BlobPart], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    // Revoked after the click has had a chance to start the download —
    // revoking synchronously can cancel it in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleDownloadPhone() {
    setDownloadingPhone(true);
    setPhoneDownloadError(null);
    setPhoneDownloadDropped([]);
    try {
      // Dynamic, not static: @washy-washy/pdf pulls in @react-pdf/renderer
      // and pdf-lib, which nothing needs until this click — a static import
      // would ship both in the page's main chunk regardless.
      const { renderPhone } = await import("@washy-washy/pdf");
      const { pdf, dropped } = await renderPhone(filtered, activeMachine, cut);
      savePdf(pdf, `${STEM}-phone${SUFFIX[cut]}.pdf`);
      setPhoneDownloadDropped(dropped);
    } catch (reason) {
      setPhoneDownloadError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setDownloadingPhone(false);
    }
  }

  /**
   * `renderPrint`'s A4 reference table + one detail card per pile, the
   * same content `bun run generate`'s print PDF has always had — just not
   * reachable from the web app until now (#122). Bisects table/type
   * density itself, the same way `renderPhone` bisects height; nothing
   * here needs to know that.
   */
  async function handleDownloadPrint() {
    setDownloadingPrint(true);
    setPrintDownloadError(null);
    setPrintDownloadDropped([]);
    try {
      const { renderPrint } = await import("@washy-washy/pdf");
      const { pdf, dropped } = await renderPrint(filtered, activeMachine, cut);
      savePdf(pdf, `${STEM}-print${SUFFIX[cut]}.pdf`);
      setPrintDownloadDropped(dropped);
    } catch (reason) {
      setPrintDownloadError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setDownloadingPrint(false);
    }
  }

  // Passed to Sheet -> Card as callbacks (Sheet.tsx can't touch window/
  // document/navigator itself — see the comment on CardActions there).
  // Returns `dropped` (characters the PDF's font couldn't render) so
  // CardActions can surface it the same way handleDownloadPhone does above.
  // Phone-only, deliberately: renderPrint always draws a reference table
  // plus every pile's own card, never one pile in isolation, so there's no
  // per-card equivalent to offer here (#122).
  //
  // renderCard, not renderPhone with a one-group slice: the latter drew
  // the whole phone-sheet chrome (loads table, legend) around the single
  // card, and tripped react-pdf's "Node of type VIEW can't wrap between
  // pages" warning doing it. renderCard is the dedicated single-card
  // layout `@washy-washy/pdf` added for exactly this (#77).
  async function handleDownloadCard(group: ResolvedInstruction[]): Promise<string[]> {
    const { renderCard } = await import("@washy-washy/pdf");
    const { pdf, dropped } = await renderCard(group, activeMachine, cut);
    const names = [...new Set(group.map((member) => slug(member.clothingType)))];
    savePdf(pdf, `${names.join("-")}.pdf`);
    return dropped;
  }

  async function handleShareCard(group: ResolvedInstruction[]) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("cut", cut);
    url.searchParams.set("pile", (group[0] as ResolvedInstruction).clothingType);
    await navigator.clipboard.writeText(url.toString());
  }

  /**
   * The whole page's own share button — `window.location.href` as-is,
   * filter state and all, since `urlHistory.ts` already keeps the address
   * bar in sync with every filter change live. Tries the native share
   * sheet first (mobile is this site's primary device, per `TEXT_INPUT`'s
   * own comment in `styles.ts`), falling back to the clipboard — same as
   * `handleShareCard` above always does, just without a share sheet to
   * try first (#112).
   *
   * When a custom machine/chart is active, the link also carries the
   * whole config, compressed, as a #config=... hash — "the exact state of
   * the site" someone can open cold, not just the filters against
   * whatever they already had loaded (#123). Re-reads storage rather than
   * using `customItems`'s already-resolved state: the raw Config (with
   * its unresolved chart) is what needs re-encoding, and storage is the
   * one place that's still kept in that shape.
   */
  async function handleShareSheet() {
    setShareError(null);
    const config = readCustomConfig();
    const shareUrl = new URL(window.location.href);
    shareUrl.hash = config ? await encodeConfigHash(config) : "";
    const url = shareUrl.toString();

    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch (reason) {
        // The visitor closed the share sheet without picking anything —
        // not a failure, nothing to report or fall back for.
        if (reason instanceof Error && reason.name === "AbortError") return;
        // Any other share failure (no target app, a permissions policy)
        // still has the clipboard to fall through to below, rather than
        // failing outright over a share mechanism that was only ever a
        // convenience.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Copied!");
      setTimeout(() => setShareStatus(""), 2000);
    } catch (reason) {
      setShareError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  return (
    <div className="flex flex-col gap-6" data-hydrated={hydrated}>
      <fieldset className="rounded-lg border border-hairline bg-panel p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Filter the chart</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <span className={`block ${FIELD_LABEL}`}>
              <label htmlFor="filter-cut">Cut</label>
              <HelpBubble
                id="filter-cut-help"
                text="Which parts of the chart to show: everything, washing only, or ironing only."
              />
            </span>
            <select
              id="filter-cut"
              className={FIELD_INPUT}
              value={cut}
              onChange={(event) => setCut(event.target.value as Variant)}
            >
              {variants.map((variant) => (
                <option key={variant} value={variant}>
                  {CUT_LABEL[variant]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <span className={`block ${FIELD_LABEL}`}>
              <label htmlFor="filter-pile">Pile</label>
              <HelpBubble
                id="filter-pile-help"
                text={'Type part of a pile’s name, like "towels", to show just that card.'}
              />
            </span>
            <input
              id="filter-pile"
              className={FIELD_INPUT}
              type="search"
              placeholder="Search by pile name…"
              value={pileQuery}
              onChange={(event) => setPileQuery(event.target.value)}
            />
          </div>
        </div>

        {/* A plain, uncontrolled <details> — closed on every page load with
        no state or effect needed for it: nothing here ever sets `open`,
        so hydration always starts from the same closed markup the server
        rendered (#8). Only the *values* inside persist across visits, not
        whether this was left open. */}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Advanced
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className={`block ${FIELD_LABEL}`}>
                <label htmlFor="filter-program">Programme</label>
                <HelpBubble id="filter-program-help" text="Show only piles using this programme." />
              </span>
              <select
                id="filter-program"
                className={FIELD_INPUT}
                value={advanced.program}
                disabled={programOptions.length === 0}
                onChange={(event) =>
                  setAdvanced((current) => ({ ...current, program: event.target.value }))
                }
              >
                <option value="">Any programme</option>
                {programOptions.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={`block ${FIELD_LABEL}`}>
                <label htmlFor="filter-temperature">Temperature</label>
                <HelpBubble
                  id="filter-temperature-help"
                  text="Show only piles washed at this temperature."
                />
              </span>
              <select
                id="filter-temperature"
                className={FIELD_INPUT}
                value={advanced.temperature}
                disabled={temperatureOptions.length === 0}
                onChange={(event) =>
                  setAdvanced((current) => ({ ...current, temperature: event.target.value }))
                }
              >
                <option value="">Any temperature</option>
                {temperatureOptions.map((temperature) => (
                  <option key={temperature} value={temperature}>
                    {formatTemperature(temperature)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={`block ${FIELD_LABEL}`}>
                <label htmlFor="filter-spin">Spin</label>
                <HelpBubble id="filter-spin-help" text="Show only piles spun at this speed." />
              </span>
              <select
                id="filter-spin"
                className={FIELD_INPUT}
                value={advanced.spin}
                disabled={spinOptions.length === 0}
                onChange={(event) =>
                  setAdvanced((current) => ({ ...current, spin: event.target.value }))
                }
              >
                <option value="">Any spin</option>
                {spinOptions.map((spin) => (
                  <option key={spin} value={spin}>
                    {spin === "0" ? "no spin" : `${spin} rpm`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={`block ${FIELD_LABEL}`}>
                <label htmlFor="filter-detergent">Detergent</label>
                <HelpBubble
                  id="filter-detergent-help"
                  text='Type part of a detergent note, like "powder", to show only piles that mention it.'
                />
              </span>
              <input
                id="filter-detergent"
                className={FIELD_INPUT}
                type="search"
                placeholder="Search by detergent…"
                value={advanced.detergentQuery}
                onChange={(event) =>
                  setAdvanced((current) => ({ ...current, detergentQuery: event.target.value }))
                }
              />
            </div>
          </div>
        </details>
      </fieldset>

      {configHashError && (
        <p className={ALERT} role="alert">
          Could not open the shared config: {configHashError}. Showing what was already active
          instead.
        </p>
      )}
      <p className="text-sm text-body">
        {customItems
          ? "Showing your own config."
          : "Showing the bundled example chart. It's a generic laundry chart, not your own."}{" "}
        Upload, download or edit your own on the{" "}
        <a
          href="/config"
          className="underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent"
        >
          washing loads page
        </a>
        .
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-panel p-6 text-center text-sm text-body">
          {pileQuery !== "" && hasActiveAdvancedFilters(advanced)
            ? `No pile matches “${pileQuery}” with those advanced filters. Try loosening one.`
            : pileQuery !== ""
              ? `No pile matches “${pileQuery}”. Try a different search.`
              : "No pile matches those advanced filters. Try loosening one."}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={BUTTON_PRIMARY}
              type="button"
              data-testid="download-phone"
              onClick={handleDownloadPhone}
              disabled={downloadingPhone}
            >
              {downloadingPhone ? "Preparing PDF…" : "Download for phone"}
            </button>
            <button
              className={BUTTON_PRIMARY}
              type="button"
              data-testid="download-print"
              onClick={handleDownloadPrint}
              disabled={downloadingPrint}
            >
              {downloadingPrint ? "Preparing PDF…" : "Download to print"}
            </button>
            <button
              className={BUTTON_SECONDARY}
              type="button"
              data-testid="share-sheet"
              onClick={handleShareSheet}
            >
              {shareStatus === "Copied!" ? "Copied!" : "Share this view"}
            </button>
          </div>
          <p aria-live="polite" role="status" data-testid="share-sheet-status" className="sr-only">
            {shareStatus}
          </p>
          {shareError && (
            <p className={ALERT} role="alert">
              Could not share this view: {shareError}
            </p>
          )}
          {phoneDownloadError && (
            <p className={ALERT} role="alert">
              Could not generate the phone PDF: {phoneDownloadError}
            </p>
          )}
          {phoneDownloadDropped.length > 0 && (
            <p className="text-xs text-muted" role="status">
              Couldn't render in the phone PDF: {phoneDownloadDropped.join(" ")}
            </p>
          )}
          {printDownloadError && (
            <p className={ALERT} role="alert">
              Could not generate the print PDF: {printDownloadError}
            </p>
          )}
          {printDownloadDropped.length > 0 && (
            <p className="text-xs text-muted" role="status">
              Couldn't render in the print PDF: {printDownloadDropped.join(" ")}
            </p>
          )}
          <Sheet
            items={filtered}
            machine={activeMachine}
            variant={cut}
            onDownloadCard={handleDownloadCard}
            onShareCard={handleShareCard}
          />
        </>
      )}
    </div>
  );
}

const STEM = "washing-instructions";
const SUFFIX: Record<Variant, string> = { full: "", wash: "-washing", iron: "-ironing" };
