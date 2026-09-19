<script lang="ts">
import { FIELD_LABEL, TEXT_INPUT } from "../lib/styles";

interface Props {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const { label, id, value, onChange, maxLength }: Props = $props();
</script>

<div>
  <label for={id} class={FIELD_LABEL}>{label}</label>
  <input
    {id}
    class={TEXT_INPUT}
    type="text"
    {value}
    maxlength={maxLength}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</div>
