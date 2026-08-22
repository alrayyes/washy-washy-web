import {
  type Machine,
  type ResolvedInstruction,
  resolve,
  type Variant,
  variants,
} from "@washy-washy/core/browser";
import { useEffect, useMemo, useRef, useState } from "react";
import { readCustomConfig } from "../lib/customConfig";
import { filterByPile } from "../lib/filter";
import { slug } from "../lib/slug";
import { readFilters, writeFilters } from "../lib/storage";
import { readUrlFilters } from "../lib/url";
import { writeUrlFilters } from "../lib/urlHistory";
import Sheet from "./Sheet";

const CUT_LABEL: Record<Variant, string> = {
  full: "Everything",
  wash: "Washing only",
  iron: "Ironing only",
};

// text-body, not text-muted: muted-on-panel is 4.39:1, just under WCAG AA's
// 4.5:1 for this text's size and weight.
const FIELD_LABEL = "block text-xs font-semibold tracking-wide text-body uppercase";
const FIELD_INPUT =
  "mt-1 block w-full min-w-0 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";
const BUTTON_PRIMARY =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const ALERT = "rounded-md border border-no/30 bg-no/5 px-3 py-2 text-sm text-no";

/**
 * A tap-to-open "?" next to a field label — `title` alone is a hover-only
 * tooltip, which a phone (this site's main device) can't reach. Closes on
 * blur so it doesn't linger once the visitor's moved on. Always a sibling
 * of the field's own `<label>`, never nested inside it — a `<button>`
 * inside a `<label>` is invalid HTML and unreliable with assistive tech.
 */
function HelpBubble({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block normal-case">
      <button
        type="button"
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-line text-[0.6rem] font-bold text-body hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="What does this do?"
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
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
          className="absolute top-full left-0 z-10 mt-1 w-48 max-w-[80vw] rounded-md border border-line bg-white p-2 text-xs font-normal text-body shadow-md"
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
 * The in-browser answer to `bun run generate`'s phone PDF: the same chart,
 * drawn as a real page (`Sheet`) rather than an embedded PDF, filtered by
 * cut and pile instead of a filename suffix, and optionally over a chart
 * you uploaded instead of the bundled example. The PDF itself — the same
 * `renderPhone` the CLI uses — is only ever generated when the download
 * button is clicked, not on every filter change.
 */
export default function SheetViewer({ items: bundledItems, machine: bundledMachine }: Props) {
  const [cut, setCut] = useState<Variant>("full");
  const [pileQuery, setPileQuery] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadDropped, setDownloadDropped] = useState<string[]>([]);
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
    if (fromUrl.cut !== undefined || fromUrl.pileQuery !== undefined) {
      setCut(fromUrl.cut ?? "full");
      setPileQuery(fromUrl.pileQuery ?? "");
    } else {
      const saved = readFilters();
      if (saved) {
        setCut(saved.cut);
        setPileQuery(saved.pileQuery);
      }
    }
    const config = readCustomConfig();
    if (config) {
      setActiveMachine(config.machine);
      setCustomItems(resolve(config.chart));
    }
    restored.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Skipped on the mount render: without this, restoring a saved filter
    // above would immediately be overwritten by writing back the still-
    // default state from this same effect.
    if (!restored.current) return;
    writeFilters({ cut, pileQuery });
    writeUrlFilters({ cut, pileQuery });
  }, [cut, pileQuery]);

  const sourceItems = customItems ?? bundledItems;
  const filtered = useMemo(() => filterByPile(sourceItems, pileQuery), [sourceItems, pileQuery]);

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

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    setDownloadDropped([]);
    try {
      // Dynamic, not static: @washy-washy/pdf pulls in @react-pdf/renderer
      // and pdf-lib, which nothing needs until this click — a static import
      // would ship both in the page's main chunk regardless.
      const { renderPhone } = await import("@washy-washy/pdf");
      const { pdf, dropped } = await renderPhone(filtered, activeMachine, cut);
      savePdf(pdf, `${STEM}-phone${SUFFIX[cut]}.pdf`);
      setDownloadDropped(dropped);
    } catch (reason) {
      setDownloadError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setDownloading(false);
    }
  }

  // Passed to Sheet -> Card as callbacks (Sheet.tsx can't touch window/
  // document/navigator itself — see the comment on CardActions there).
  // Returns `dropped` (characters the PDF's font couldn't render) so
  // CardActions can surface it the same way handleDownload does above.
  async function handleDownloadCard(group: ResolvedInstruction[]): Promise<string[]> {
    const { renderPhone } = await import("@washy-washy/pdf");
    const { pdf, dropped } = await renderPhone(group, activeMachine, cut);
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

  return (
    <div className="flex flex-col gap-6" data-hydrated={hydrated}>
      <fieldset className="rounded-lg border border-hairline bg-panel p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Filter the chart</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <span className={FIELD_LABEL}>
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
            <span className={FIELD_LABEL}>
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
      </fieldset>

      <p className="text-sm text-body">
        {customItems
          ? "Showing your own config."
          : "Showing the bundled example chart. It's a generic laundry chart, not your own."}{" "}
        Upload, download or edit your own on the{" "}
        <a
          href="/config"
          className="underline decoration-hairline underline-offset-2 hover:text-accent hover:decoration-accent"
        >
          washing loads page
        </a>
        .
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-panel p-6 text-center text-sm text-body">
          No pile matches “{pileQuery}”. Try a different search.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={BUTTON_PRIMARY}
              type="button"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Preparing PDF…" : "Download this sheet as a PDF"}
            </button>
          </div>
          {downloadError && (
            <p className={ALERT} role="alert">
              Could not generate the PDF: {downloadError}
            </p>
          )}
          {downloadDropped.length > 0 && (
            <p className="text-xs text-muted" role="status">
              Couldn't render in the PDF: {downloadDropped.join(" ")}
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
