<script lang="ts">
import type { Iron, IronSetting } from "@washy-washy/core/browser";
import type { TranslationParams, Ui } from "../i18n/ui";
import { MACHINE_FIELD_LIMITS } from "../lib/fieldLimits";
import { slug } from "../lib/slug";
import { CARD, FIELD_LABEL, TEXT_INPUT } from "../lib/styles";
import EditableField from "./EditableField.svelte";

interface Props {
  iron: Iron;
  onChange: (iron: Iron) => void;
  t: (key: keyof Ui, params?: TranslationParams) => string;
}

const { iron, onChange, t }: Props = $props();

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
        label: t("machine.newSettingDefaultLabel"),
        detail: "",
        steam: false,
      },
    ],
  });
}

function removeSetting(index: number) {
  onChange({ ...iron, settings: iron.settings.filter((_, i) => i !== index) });
}
</script>

<div class={CARD}>
  <EditableField
    label={t("common.name")}
    id="iron-name"
    value={iron.name}
    onChange={(v) => onChange({ ...iron, name: v })}
    maxLength={MACHINE_FIELD_LIMITS.ironName}
  />
  <h3 class={`${FIELD_LABEL} mt-3`}>{t("machine.settingsHeading")}</h3>
  <!-- contain-layout (#47): overflow-x-auto alone correctly scrolls the
  table within its own bounds — confirmed, this wrapper's own box was
  already the right width — but a <table> wider than its ancestor
  still leaks into document.documentElement.scrollWidth regardless,
  forcing the whole page to scroll horizontally. contain: layout
  stops that leak without changing the scroll behaviour itself.
  Below sm: this table is hidden entirely (#102) in favour of the
  stacked cards below — dragging sideways through a 512px table on
  a phone is worse than the scroll this already fixed. Both copies
  share one data-testid-scoped locator each so a test never has to
  guess which markup is actually on screen at a given viewport. -->
  <div
    data-testid="iron-settings-table"
    class="mt-1 hidden overflow-x-auto contain-layout sm:block"
  >
    <table class="w-full min-w-[32rem] text-left text-sm">
      <thead>
        <tr class="border-b border-hairline text-xs text-body uppercase">
          <th class="py-1 pr-3 font-semibold">{t("machine.settingColumnHeader")}</th>
          <th class="py-1 pr-3 font-semibold">{t("machine.dotsColumnHeader")}</th>
          <th class="py-1 pr-3 font-semibold">{t("machine.detailColumnHeader")}</th>
          <th class="py-1 pr-3 font-semibold">{t("machine.steamColumnHeader")}</th>
          <th class="py-1 font-semibold">
            <span class="sr-only">{t("common.remove")}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each iron.settings as setting, index (setting.key)}
          <tr class="border-b border-hairline last:border-0">
            <td class="py-1 pr-3">
              <input
                class={TEXT_INPUT}
                aria-label={t("machine.settingLabelAria", { n: index + 1 })}
                type="text"
                maxlength={MACHINE_FIELD_LIMITS.settingLabel}
                value={setting.label}
                oninput={(event) => setSetting(index, { label: event.currentTarget.value })}
              />
            </td>
            <td class="py-1 pr-3">
              <input
                class={`${TEXT_INPUT} w-16! min-w-0!`}
                aria-label={t("machine.settingDotsAria", { n: index + 1 })}
                type="text"
                maxlength={MACHINE_FIELD_LIMITS.settingDots}
                value={setting.dots}
                oninput={(event) => setSetting(index, { dots: event.currentTarget.value })}
              />
            </td>
            <td class="py-1 pr-3">
              <input
                class={TEXT_INPUT}
                aria-label={t("machine.settingDetailAria", { n: index + 1 })}
                type="text"
                maxlength={MACHINE_FIELD_LIMITS.settingDetail}
                value={setting.detail}
                oninput={(event) => setSetting(index, { detail: event.currentTarget.value })}
              />
            </td>
            <td class="py-1 pr-3">
              <input
                type="checkbox"
                class="h-4 w-4"
                aria-label={t("machine.settingSteamAria", { n: index + 1 })}
                checked={setting.steam}
                onchange={(event) => setSetting(index, { steam: event.currentTarget.checked })}
              />
            </td>
            <td class="py-1">
              <button
                type="button"
                class="rounded border border-line px-1.5 py-0.5 text-xs text-body hover:border-no hover:text-no-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onclick={() => removeSetting(index)}
                aria-label={t("machine.removeSettingAria", { n: index + 1 })}
              >
                {t("common.remove")}
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- The same fields and the same handlers as the table above, stacked
  instead of laid out sideways (#102) — a rendering change only, so
  this reuses setSetting/removeSetting rather than any state of its
  own. Hidden from sm: up, where the table takes over. -->
  <div data-testid="iron-settings-cards" class="mt-1 flex flex-col gap-3 sm:hidden">
    {#each iron.settings as setting, index (setting.key)}
      <div class="rounded-md border border-hairline p-3">
        <div class="flex flex-col gap-2">
          <div>
            <span class={FIELD_LABEL}>{t("machine.settingColumnHeader")}</span>
            <input
              class={`${TEXT_INPUT} mt-1`}
              aria-label={t("machine.settingLabelAria", { n: index + 1 })}
              type="text"
              maxlength={MACHINE_FIELD_LIMITS.settingLabel}
              value={setting.label}
              oninput={(event) => setSetting(index, { label: event.currentTarget.value })}
            />
          </div>
          <div>
            <span class={FIELD_LABEL}>{t("machine.dotsColumnHeader")}</span>
            <input
              class={`${TEXT_INPUT} mt-1`}
              aria-label={t("machine.settingDotsAria", { n: index + 1 })}
              type="text"
              maxlength={MACHINE_FIELD_LIMITS.settingDots}
              value={setting.dots}
              oninput={(event) => setSetting(index, { dots: event.currentTarget.value })}
            />
          </div>
          <div>
            <span class={FIELD_LABEL}>{t("machine.detailColumnHeader")}</span>
            <input
              class={`${TEXT_INPUT} mt-1`}
              aria-label={t("machine.settingDetailAria", { n: index + 1 })}
              type="text"
              maxlength={MACHINE_FIELD_LIMITS.settingDetail}
              value={setting.detail}
              oninput={(event) => setSetting(index, { detail: event.currentTarget.value })}
            />
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-2 text-sm text-body">
              <input
                type="checkbox"
                class="h-4 w-4"
                aria-label={t("machine.settingSteamAria", { n: index + 1 })}
                checked={setting.steam}
                onchange={(event) => setSetting(index, { steam: event.currentTarget.checked })}
              />
              {t("machine.steamColumnHeader")}
            </span>
            <button
              type="button"
              class="rounded border border-line px-1.5 py-0.5 text-xs text-body hover:border-no hover:text-no-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onclick={() => removeSetting(index)}
              aria-label={t("machine.removeSettingAria", { n: index + 1 })}
            >
              {t("common.remove")}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <button
    type="button"
    class="mt-2 rounded border border-line px-2 py-1 text-xs font-semibold text-body hover:border-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    onclick={addSetting}
  >
    {t("machine.addSetting")}
  </button>
</div>
