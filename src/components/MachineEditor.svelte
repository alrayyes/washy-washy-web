<!--
  The washer and iron, on their own page — split out of the config page
  (#30) so machine setup isn't lost among fifteen-per-pile chart cards.
  Reads and writes the same combined `Config` `/config` does
  (`customConfig.ts`); editing here and clicking away without Save loses
  the edit, the same way `/config`'s own chart editor already works — no
  new inconsistency, just the existing app-wide pattern applied here too.

  No TranslationProvider here (that was a React Context) — this whole
  component tree is Svelte, so `t`/`locale` are plain values computed once
  here and passed down as props to EditableField/StringListEditor/
  WasherEditor/IronEditor instead.
-->
<script lang="ts">
import {
  type Config,
  configFromJson,
  configToJson,
  type Instruction,
  type Iron,
  instructionsFromRows,
  type Machine,
  parseMachine,
  rowsFromInstructions,
  type Washer,
} from "@washy-washy/core/browser";
import { onMount } from "svelte";
import { type Locale, relativeLocaleUrl } from "../i18n/locales";
import { translator } from "../i18n/ui";
import { readCustomConfig, writeCustomConfig } from "../lib/customConfig";
import {
  ALERT,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_LABEL,
  SECTION_HEADING,
} from "../lib/styles";
import IronEditor from "./IronEditor.svelte";
import WasherEditor from "./WasherEditor.svelte";

const SECTION = "mb-6";

interface Props {
  items: Instruction[];
  machine: Machine;
  locale: Locale;
}

const { items: bundledItems, machine: bundledMachine, locale }: Props = $props();

const t = $derived(translator(locale));

let customConfig = $state<Config | null>(null);
let draftWasher = $state<Washer>(bundledMachine.washer);
let draftIron = $state<Iron>(bundledMachine.iron);
let saveError = $state<string | null>(null);
let uploadError = $state<string | null>(null);
let hydrated = $state(false);

onMount(() => {
  const restored = readCustomConfig();
  customConfig = restored;
  draftWasher = restored?.machine.washer ?? bundledMachine.washer;
  draftIron = restored?.machine.iron ?? bundledMachine.iron;
  hydrated = true;
});

function currentChart(): Instruction[] {
  return customConfig?.chart ?? bundledItems;
}

// A customConfig can exist purely to preserve a customised chart after
// handleResetMachine — that's not "your own machine" any more, so this
// compares the machine itself, not just whether any customConfig exists.
const machineIsCustom = $derived(
  customConfig != null && JSON.stringify(customConfig.machine) !== JSON.stringify(bundledMachine),
);
// The saved config, same as /config's own download link — not the
// draft: an in-progress, unsaved edit isn't what "download my config"
// means here any more than it does there (#130).
const downloadHref = $derived.by(() => {
  const config: Config = customConfig ?? { machine: bundledMachine, chart: bundledItems };
  return `data:application/json;charset=utf-8,${encodeURIComponent(configToJson(config))}`;
});

function handleSave() {
  try {
    // Validated together, same as /config's own Save: an edit that
    // breaks the active chart (a removed programme a row still uses) is
    // named by row and column, not a silent inconsistency.
    const candidateMachine = parseMachine({ washer: draftWasher, iron: draftIron });
    const chart = instructionsFromRows(rowsFromInstructions(currentChart()), candidateMachine);
    const config: Config = { machine: candidateMachine, chart };
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

  file
    .text()
    .then((text) => {
      const config = configFromJson(text);
      customConfig = config;
      draftWasher = config.machine.washer;
      draftIron = config.machine.iron;
      writeCustomConfig(config);
      uploadError = null;
    })
    .catch((reason) => {
      uploadError = reason instanceof Error ? reason.message : String(reason);
    });
}

function handleResetMachine() {
  // Scoped to the machine only — preserves whatever chart is active
  // rather than clearing the whole config the way /config's "Use the
  // bundled example instead" does.
  const config: Config = { machine: bundledMachine, chart: currentChart() };
  customConfig = config;
  draftWasher = bundledMachine.washer;
  draftIron = bundledMachine.iron;
  writeCustomConfig(config);
  saveError = null;
  uploadError = null;
}
</script>

<div data-hydrated={hydrated}>
  <p class="mb-1 text-sm text-body">
    {machineIsCustom ? t("machine.showingOwnMachine") : t("machine.showingBundledMachine")}
  </p>
  <p class="mb-6 text-xs text-muted">
    {t("machine.changesApplyPrefix")}
    <a
      href={relativeLocaleUrl(locale, "/config")}
      class="underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent"
    >
      {t("common.washingLoadsPageLink")}
    </a>
    {t("machine.changesApplySuffix")}
  </p>

  <section class={SECTION}>
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <label class="flex-1 sm:flex-none">
        <span class={FIELD_LABEL}>{t("common.uploadConfigJson")}</span>
        <input
          class="mt-1 block w-full text-sm text-body file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent/90"
          type="file"
          accept="application/json,.json"
          onchange={handleUpload}
        />
      </label>
      <a class={BUTTON_SECONDARY} href={downloadHref} download="washy-washy.json">
        {t("common.downloadCurrentConfig")}
      </a>
      {#if machineIsCustom}
        <button class={BUTTON_SECONDARY} type="button" onclick={handleResetMachine}>
          {t("machine.useBundledMachineInstead")}
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
    <h2 class={SECTION_HEADING}>{t("machine.washerHeading")}</h2>
    <WasherEditor
      washer={draftWasher}
      onChange={(washer) => {
        draftWasher = washer;
      }}
      {t}
    />
  </section>

  <section class={SECTION}>
    <h2 class={SECTION_HEADING}>{t("common.iron")}</h2>
    <IronEditor
      iron={draftIron}
      onChange={(iron) => {
        draftIron = iron;
      }}
      {t}
    />
  </section>

  <div class="flex flex-wrap items-center gap-3">
    <button type="button" class={BUTTON_PRIMARY} onclick={handleSave}>
      {t("common.saveChanges")}
    </button>
  </div>
  {#if saveError}
    <p class={`${ALERT} mt-3`} role="alert">
      {t("common.couldNotSave", { error: saveError })}
    </p>
  {/if}
</div>
