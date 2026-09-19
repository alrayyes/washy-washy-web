<!--
  Add, remove and reorder — the direct replacement for a comma-separated
  text field. A dial's programme order is meaningful (index is the angle,
  per `Washer`'s own doc comment), so reordering is a real feature here,
  not decoration.
-->
<script lang="ts">
import type { TranslationParams, Ui } from "../i18n/ui";
import { slug } from "../lib/slug";
import { FIELD_LABEL, TEXT_INPUT } from "../lib/styles";

const ITEM_BUTTON =
  "rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-body hover:border-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

interface Props {
  label: string;
  hint?: string;
  /** Per-list, not derived from `label` — translated singularisation doesn't generalise across languages. */
  addPlaceholder: string;
  addAriaLabel: string;
  values: string[];
  onChange: (values: string[]) => void;
  maxLength?: number;
  t: (key: keyof Ui, params?: TranslationParams) => string;
}

const { label, hint, addPlaceholder, addAriaLabel, values, onChange, maxLength, t }: Props =
  $props();

let draft = $state("");

function add() {
  const value = draft.trim();
  if (!value) return;
  onChange([...values, value]);
  draft = "";
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
</script>

<div data-testid={`list-editor-${slug(label)}`}>
  <h3 class={FIELD_LABEL}>{label}</h3>
  <!-- text-body, not text-muted: muted-on-panel is 4.40:1, just under
  WCAG AA's 4.5:1 (#57) — see the same note in SheetViewer.tsx. -->
  {#if hint}
    <p class="mt-0.5 mb-1 text-xs text-body">{hint}</p>
  {/if}
  <ul class="flex flex-col gap-1">
    <!-- A freeform string list has no id of its own, and a value alone
    isn't guaranteed unique — same synthetic key the original React list
    used. -->
    {#each values as value, index (`${value}-${index}`)}
      <li class="flex items-center gap-1">
        <span class="flex-1 rounded border border-hairline bg-surface px-2 py-1 text-sm text-ink">
          {value}
        </span>
        <button
          type="button"
          class={ITEM_BUTTON}
          onclick={() => move(index, -1)}
          disabled={index === 0}
          aria-label={t("machine.moveUp", { value })}
        >
          ↑
        </button>
        <button
          type="button"
          class={ITEM_BUTTON}
          onclick={() => move(index, 1)}
          disabled={index === values.length - 1}
          aria-label={t("machine.moveDown", { value })}
        >
          ↓
        </button>
        <button
          type="button"
          class={ITEM_BUTTON}
          onclick={() => remove(index)}
          aria-label={t("machine.removeItem", { value })}
        >
          {t("common.remove")}
        </button>
      </li>
    {/each}
  </ul>
  <div class="mt-2 flex gap-2">
    <input
      class={TEXT_INPUT}
      type="text"
      value={draft}
      placeholder={addPlaceholder}
      aria-label={addAriaLabel}
      maxlength={maxLength}
      oninput={(event) => {
        draft = event.currentTarget.value;
      }}
      onkeydown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          add();
        }
      }}
    />
    <button type="button" class={ITEM_BUTTON} onclick={add}>
      {t("machine.addButton")}
    </button>
  </div>
</div>
