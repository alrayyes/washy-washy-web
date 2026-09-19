<script lang="ts">
import type { Washer } from "@washy-washy/core/browser";
import type { TranslationParams, Ui } from "../i18n/ui";
import { MACHINE_FIELD_LIMITS } from "../lib/fieldLimits";
import { CARD } from "../lib/styles";
import EditableField from "./EditableField.svelte";
import StringListEditor from "./StringListEditor.svelte";

interface Props {
  washer: Washer;
  onChange: (washer: Washer) => void;
  t: (key: keyof Ui, params?: TranslationParams) => string;
}

const { washer, onChange, t }: Props = $props();

function set<K extends keyof Washer>(key: K, value: Washer[K]) {
  onChange({ ...washer, [key]: value });
}
</script>

<div class={CARD}>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <EditableField
      label={t("common.name")}
      id="washer-name"
      value={washer.name}
      onChange={(v) => set("name", v)}
      maxLength={MACHINE_FIELD_LIMITS.washerName}
    />
    <EditableField
      label={t("machine.capacityLabel")}
      id="washer-capacity"
      value={washer.capacity}
      onChange={(v) => set("capacity", v)}
      maxLength={MACHINE_FIELD_LIMITS.washerCapacity}
    />
  </div>
  <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
    <StringListEditor
      label={t("config.programmes")}
      hint={t("machine.programmesHint")}
      addPlaceholder={t("machine.addPlaceholderProgramme")}
      addAriaLabel={t("machine.addAriaProgramme")}
      values={washer.programs}
      onChange={(v) => set("programs", v)}
      maxLength={MACHINE_FIELD_LIMITS.program}
      {t}
    />
    <StringListEditor
      label={t("machine.temperaturesLabel")}
      addPlaceholder={t("machine.addPlaceholderTemperature")}
      addAriaLabel={t("machine.addAriaTemperature")}
      values={washer.temperatures}
      onChange={(v) => set("temperatures", v)}
      maxLength={MACHINE_FIELD_LIMITS.temperature}
      {t}
    />
    <StringListEditor
      label={t("config.spinSpeeds")}
      addPlaceholder={t("machine.addPlaceholderSpin")}
      addAriaLabel={t("machine.addAriaSpin")}
      values={washer.spins}
      onChange={(v) => set("spins", v)}
      maxLength={MACHINE_FIELD_LIMITS.spin}
      {t}
    />
    <StringListEditor
      label={t("common.buttons")}
      addPlaceholder={t("machine.addPlaceholderButton")}
      addAriaLabel={t("machine.addAriaButton")}
      values={washer.options}
      onChange={(v) => set("options", v)}
      maxLength={MACHINE_FIELD_LIMITS.option}
      {t}
    />
  </div>
</div>
