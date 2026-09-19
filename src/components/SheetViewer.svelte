<script module lang="ts">
import type { Variant } from "@washy-washy/core/browser";

const FIELD_INPUT =
  "mt-1 block w-full min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";

const STEM = "washing-instructions";
const SUFFIX: Record<Variant, string> = { full: "", wash: "-washing", iron: "-ironing" };
</script>

<script lang="ts">
import {
  formatTemperature,
  type Machine,
  type ResolvedInstruction,
  resolve,
  variants,
} from "@washy-washy/core/browser";
import { onMount } from "svelte";
import { type Locale, relativeLocaleUrl } from "../i18n/locales";
import { translator } from "../i18n/ui";
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
import { readFilters, type StoredFilters, writeFilters } from "../lib/storage";
import { ALERT, BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_LABEL } from "../lib/styles";
import { readUrlFilters } from "../lib/url";
import { writeUrlFilters } from "../lib/urlHistory";
import HelpBubble from "./HelpBubble.svelte";
import Sheet from "./Sheet.svelte";

interface Props {
  items: ResolvedInstruction[];
  machine: Machine;
  locale: Locale;
}

/**
 * The in-browser answer to `bun run generate`'s PDFs: the same chart, drawn
 * as a real page (`Sheet`) rather than an embedded PDF, filtered by cut and
 * pile instead of a filename suffix, and optionally over a chart you
 * uploaded instead of the bundled example. The PDFs themselves — the same
 * `renderPhone`/`renderPrint` the CLI uses — are only ever generated when
 * one of the two download buttons is clicked, not on every filter change
 * (#122).
 *
 * Ported from SheetViewer.tsx (#243), dropping the `TranslationProvider`
 * wrapper the same way every other stage of this migration has: `t` is
 * computed once here (`translator(locale)`) and passed down as a plain
 * prop, all the way to `Sheet`/`CardActions`/`HelpBubble`. There's no
 * `SheetViewerContent` split any more either — that split only existed to
 * let the outer component set up the provider around the inner one, and
 * with no provider to set up, one component does the whole job.
 */
let { items: bundledItems, machine: bundledMachine, locale }: Props = $props();

const t = $derived(translator(locale));
const CUT_LABEL = $derived.by(
  () =>
    ({
      full: t("sheetViewer.cutEverything"),
      wash: t("sheetViewer.cutWashOnly"),
      iron: t("sheetViewer.cutIronOnly"),
    }) satisfies Record<Variant, string>,
);

let cut = $state<Variant>("full");
let pileQuery = $state("");
let advanced = $state<AdvancedFilters>({ ...emptyAdvancedFilters });
let downloadingPhone = $state(false);
let phoneDownloadError = $state<string | null>(null);
let phoneDownloadDropped = $state<string[]>([]);
let downloadingPrint = $state(false);
let printDownloadError = $state<string | null>(null);
let printDownloadDropped = $state<string[]>([]);
let shareStatus = $state("");
let shareError = $state<string | null>(null);
let configHashError = $state<string | null>(null);
// Machine and chart together — whatever was last uploaded or edited on
// the config page (customConfig.ts). null means "nothing active,
// showing the bundled example," the same as before.
//
// Seeded from the `bundledMachine` prop's initial value only, same as the
// original `useState<Machine>(bundledMachine)` — reassigned explicitly by
// onMount/handleShareSheet below whenever a custom config becomes active,
// never re-derived from the prop itself. Every caller (HomePage.astro)
// passes `machine` once at mount from the page's own locale-scoped chart;
// Astro serves each locale as its own page, a full navigation apart, so
// nothing here ever re-renders this component with a *different* machine
// prop — same reasoning `TranslationProvider.tsx`'s own now-removed
// `[locale]` dependency comment already made for `locale` (#243).
let activeMachine = $state<Machine>(bundledMachine);
let customItems = $state<ResolvedInstruction[] | null>(null);
// Read by the E2E suite (`[data-hydrated="true"]`), which otherwise has no
// way to tell that Svelte has attached its listeners: a `selectOption` or
// `fill` fired at the plain server-rendered HTML still "succeeds" — it
// mutates the DOM directly — but the change never reaches this
// component's state, since nothing is listening yet.
let hydrated = $state(false);

// Restored client-side, in onMount — matching the server-rendered default
// (the bundled chart, no filters) on that first pass avoids a hydration
// mismatch. A plain boolean, not a rune: it only ever needs to be read
// inside the persistence $effect below, never to drive a render itself.
let restored = false;

onMount(() => {
  // A URL carrying filter state wins outright over a previous visit's
  // saved one — a shared link is meant to show what was shared, not
  // silently blend with (or lose to) whatever's already in this
  // browser's storage.
  const fromUrl = readUrlFilters(window.location.search);
  if (Object.keys(fromUrl).length > 0) {
    cut = fromUrl.cut ?? "full";
    pileQuery = fromUrl.pileQuery ?? "";
    advanced = {
      program: fromUrl.program ?? "",
      temperature: fromUrl.temperature ?? "",
      spin: fromUrl.spin ?? "",
      detergentQuery: fromUrl.detergentQuery ?? "",
    };
  } else {
    const saved = readFilters();
    if (saved) {
      cut = saved.cut;
      pileQuery = saved.pileQuery;
      advanced = {
        program: saved.program,
        temperature: saved.temperature,
        spin: saved.spin,
        detergentQuery: saved.detergentQuery,
      };
    }
  }

  // A #config=... hash wins over whatever's already saved — same
  // "what was shared is what shows" reasoning the URL filter state
  // above already follows. Async (gzip via CompressionStream), so the
  // rest of this mount's own restoration runs first, synchronously, and
  // this only overrides it if the hash actually decodes. Written as its
  // own async function called (not awaited) from this sync onMount body,
  // not an async onMount callback itself — an onMount callback that
  // returns a promise can't also return a cleanup function, so the async
  // work is kept in a helper instead.
  async function restoreConfigFromHash(): Promise<boolean> {
    const hash = window.location.hash;
    if (!hash.startsWith(`#${CONFIG_HASH_PREFIX}`)) return false;
    try {
      const config = await decodeConfigHash(hash);
      if (!config) return false;
      activeMachine = config.machine;
      customItems = resolve(config.chart);
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
      configHashError = reason instanceof Error ? reason.message : String(reason);
      return false;
    }
  }

  restoreConfigFromHash().then((restoredFromHash) => {
    if (!restoredFromHash) {
      const config = readCustomConfig();
      if (config) {
        activeMachine = config.machine;
        customItems = resolve(config.chart);
      }
    }
    restored = true;
    hydrated = true;
  });
});

$effect(() => {
  // Reads cut/pileQuery/advanced unconditionally, before the `restored`
  // check below, so this effect keeps tracking all three even on a run
  // that ends up skipped — otherwise an early return before ever reading
  // them would mean a later change to one of them never reruns this
  // effect at all.
  const snapshot: StoredFilters = { cut, pileQuery, ...advanced };
  // Skipped until onMount's own restoration above has actually finished:
  // without this, restoring a saved filter there would immediately be
  // overwritten by writing back the still-default state from this same
  // effect's first run.
  if (!restored) return;
  writeFilters(snapshot);
  writeUrlFilters(snapshot);
});

const sourceItems = $derived(customItems ?? bundledItems);
const filtered = $derived.by(() => filterAdvanced(filterByPile(sourceItems, pileQuery), advanced));
// Which Programme/Temperature/Spin values could still narrow the chart to
// something, given the pile search and whatever else is already picked —
// the active machine's own capability list can (and for the bundled
// example, does) name a value no pile actually uses (#118).
const facets = $derived.by(() => computeFacets(sourceItems, pileQuery, advanced));
const programOptions = $derived(
  facetOptions(activeMachine.washer.programs, facets.programs, advanced.program),
);
const temperatureOptions = $derived(
  facetOptions(activeMachine.washer.temperatures, facets.temperatures, advanced.temperature),
);
const spinOptions = $derived(
  facetOptions(activeMachine.washer.spins, facets.spins, advanced.spin),
);

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
  downloadingPhone = true;
  phoneDownloadError = null;
  phoneDownloadDropped = [];
  try {
    // Dynamic, not static: @washy-washy/pdf pulls in @react-pdf/renderer
    // and pdf-lib, which nothing needs until this click — a static import
    // would ship both in the page's main chunk regardless.
    const { renderPhone } = await import("@washy-washy/pdf");
    const { pdf, dropped } = await renderPhone(filtered, activeMachine, cut);
    savePdf(pdf, `${STEM}-phone${SUFFIX[cut]}.pdf`);
    phoneDownloadDropped = dropped;
  } catch (reason) {
    phoneDownloadError = reason instanceof Error ? reason.message : String(reason);
  } finally {
    downloadingPhone = false;
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
  downloadingPrint = true;
  printDownloadError = null;
  printDownloadDropped = [];
  try {
    const { renderPrint } = await import("@washy-washy/pdf");
    const { pdf, dropped } = await renderPrint(filtered, activeMachine, cut);
    savePdf(pdf, `${STEM}-print${SUFFIX[cut]}.pdf`);
    printDownloadDropped = dropped;
  } catch (reason) {
    printDownloadError = reason instanceof Error ? reason.message : String(reason);
  } finally {
    downloadingPrint = false;
  }
}

// Passed to Sheet -> CardActions as callbacks (Sheet.svelte can't touch
// window/document/navigator itself — see the comment on CardActions.svelte).
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
  shareError = null;
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
    shareStatus = t("common.copied");
    setTimeout(() => {
      shareStatus = "";
    }, 2000);
  } catch (reason) {
    shareError = reason instanceof Error ? reason.message : String(reason);
  }
}
</script>

<div class="flex flex-col gap-6" data-hydrated={hydrated}>
  <fieldset class="rounded-lg border border-hairline bg-panel p-4">
    <legend class="px-1 text-sm font-semibold text-ink">
      {t("sheetViewer.filterChart")}
    </legend>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1">
        <span class={`block ${FIELD_LABEL}`}>
          <label for="filter-cut">{t("sheetViewer.cutLabel")}</label>
          <HelpBubble id="filter-cut-help" text={t("sheetViewer.cutHelp")} {t} />
        </span>
        <select id="filter-cut" class={FIELD_INPUT} bind:value={cut}>
          {#each variants as variant (variant)}
            <option value={variant}>{CUT_LABEL[variant]}</option>
          {/each}
        </select>
      </div>
      <div class="flex-1">
        <span class={`block ${FIELD_LABEL}`}>
          <label for="filter-pile">{t("common.pile")}</label>
          <HelpBubble id="filter-pile-help" text={t("sheetViewer.pileHelp")} {t} />
        </span>
        <input
          id="filter-pile"
          class={FIELD_INPUT}
          type="search"
          placeholder={t("sheetViewer.pileSearchPlaceholder")}
          bind:value={pileQuery}
        />
      </div>
    </div>

    <!-- A plain, uncontrolled <details> — closed on every page load with
    no state or effect needed for it: nothing here ever sets `open`,
    so hydration always starts from the same closed markup the server
    rendered (#8). Only the *values* inside persist across visits, not
    whether this was left open. -->
    <details class="mt-3">
      <summary
        class="cursor-pointer text-sm font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t("sheetViewer.advanced")}
      </summary>
      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <span class={`block ${FIELD_LABEL}`}>
            <label for="filter-program">{t("common.programme")}</label>
            <HelpBubble id="filter-program-help" text={t("sheetViewer.programmeHelp")} {t} />
          </span>
          <select
            id="filter-program"
            class={FIELD_INPUT}
            disabled={programOptions.length === 0}
            bind:value={advanced.program}
          >
            <option value="">{t("sheetViewer.anyProgramme")}</option>
            {#each programOptions as program (program)}
              <option value={program}>{program}</option>
            {/each}
          </select>
        </div>
        <div>
          <span class={`block ${FIELD_LABEL}`}>
            <label for="filter-temperature">{t("sheetViewer.temperatureLabel")}</label>
            <HelpBubble
              id="filter-temperature-help"
              text={t("sheetViewer.temperatureHelp")}
              {t}
            />
          </span>
          <select
            id="filter-temperature"
            class={FIELD_INPUT}
            disabled={temperatureOptions.length === 0}
            bind:value={advanced.temperature}
          >
            <option value="">{t("sheetViewer.anyTemperature")}</option>
            {#each temperatureOptions as temperature (temperature)}
              <option value={temperature}>{formatTemperature(temperature)}</option>
            {/each}
          </select>
        </div>
        <div>
          <span class={`block ${FIELD_LABEL}`}>
            <label for="filter-spin">{t("sheetViewer.spinLabel")}</label>
            <HelpBubble id="filter-spin-help" text={t("sheetViewer.spinHelp")} {t} />
          </span>
          <select
            id="filter-spin"
            class={FIELD_INPUT}
            disabled={spinOptions.length === 0}
            bind:value={advanced.spin}
          >
            <option value="">{t("sheetViewer.anySpin")}</option>
            {#each spinOptions as spin (spin)}
              <option value={spin}>{spin === "0" ? t("common.noSpin") : `${spin} rpm`}</option>
            {/each}
          </select>
        </div>
        <div>
          <span class={`block ${FIELD_LABEL}`}>
            <label for="filter-detergent">{t("common.detergent")}</label>
            <HelpBubble id="filter-detergent-help" text={t("sheetViewer.detergentHelp")} {t} />
          </span>
          <input
            id="filter-detergent"
            class={FIELD_INPUT}
            type="search"
            placeholder={t("sheetViewer.detergentSearchPlaceholder")}
            bind:value={advanced.detergentQuery}
          />
        </div>
      </div>
    </details>
  </fieldset>

  {#if configHashError}
    <p class={ALERT} role="alert">
      {t("sheetViewer.sharedConfigError", { error: configHashError })}
    </p>
  {/if}
  <p class="text-sm text-body">
    {customItems ? t("common.showingOwnConfig") : t("sheetViewer.showingBundledChart")}
    {t("sheetViewer.uploadEditPrefix")}
    <a
      href={relativeLocaleUrl(locale, "/config")}
      class="underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent"
    >
      {t("common.washingLoadsPageLink")}
    </a>.
  </p>

  {#if filtered.length === 0}
    <p class="rounded-lg border border-hairline bg-panel p-6 text-center text-sm text-body">
      {#if pileQuery !== "" && hasActiveAdvancedFilters(advanced)}
        {t("sheetViewer.noPileMatchAdvanced", { query: pileQuery })}
      {:else if pileQuery !== ""}
        {t("sheetViewer.noPileMatchQuery", { query: pileQuery })}
      {:else}
        {t("sheetViewer.noPileMatchAdvancedOnly")}
      {/if}
    </p>
  {:else}
    <div class="flex flex-wrap items-center gap-3">
      <button
        class={BUTTON_PRIMARY}
        type="button"
        data-testid="download-phone"
        onclick={handleDownloadPhone}
        disabled={downloadingPhone}
      >
        {downloadingPhone ? t("sheetViewer.preparingPdf") : t("sheetViewer.downloadForPhone")}
      </button>
      <button
        class={BUTTON_PRIMARY}
        type="button"
        data-testid="download-print"
        onclick={handleDownloadPrint}
        disabled={downloadingPrint}
      >
        {downloadingPrint ? t("sheetViewer.preparingPdf") : t("sheetViewer.downloadToPrint")}
      </button>
      <button
        class={BUTTON_SECONDARY}
        type="button"
        data-testid="share-sheet"
        onclick={handleShareSheet}
      >
        {shareStatus === t("common.copied") ? t("common.copied") : t("sheetViewer.shareThisView")}
      </button>
    </div>
    <p aria-live="polite" role="status" data-testid="share-sheet-status" class="sr-only">
      {shareStatus}
    </p>
    {#if shareError}
      <p class={ALERT} role="alert">
        {t("sheetViewer.couldNotShare", { error: shareError })}
      </p>
    {/if}
    {#if phoneDownloadError}
      <p class={ALERT} role="alert">
        {t("sheetViewer.couldNotGeneratePhonePdf", { error: phoneDownloadError })}
      </p>
    {/if}
    {#if phoneDownloadDropped.length > 0}
      <p class="text-xs text-muted" role="status">
        {t("sheetViewer.couldntRenderPhone", { chars: phoneDownloadDropped.join(" ") })}
      </p>
    {/if}
    {#if printDownloadError}
      <p class={ALERT} role="alert">
        {t("sheetViewer.couldNotGeneratePrintPdf", { error: printDownloadError })}
      </p>
    {/if}
    {#if printDownloadDropped.length > 0}
      <p class="text-xs text-muted" role="status">
        {t("sheetViewer.couldntRenderPrint", { chars: printDownloadDropped.join(" ") })}
      </p>
    {/if}
    <Sheet
      items={filtered}
      machine={activeMachine}
      variant={cut}
      {t}
      onDownloadCard={handleDownloadCard}
      onShareCard={handleShareCard}
    />
  {/if}
</div>
