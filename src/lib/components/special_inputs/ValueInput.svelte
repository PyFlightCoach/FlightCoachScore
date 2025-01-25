<script lang="ts">
	import * as inputs from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
	import MPNumberInput from './MPNumberInput.svelte';
	import RollInput from './RollInput.svelte';

	let {
		name,
		value = $bindable(),
		refvalue = $bindable(),
		canEdit = false,
		mps,
		onchange = () => {}
	}: {
		name: keyof typeof inputs.inputMap;
		value: inputs.Arg;
		refvalue: inputs.Arg;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		onchange?: (newvalue: inputs.Arg) => void;
	} = $props();

	const input = $derived(inputs.inputMap[name]);
  
	const hasChanged = $derived(inputs.equals(value, refvalue) ? '' : 'table-warning');
</script>

<td class="text-start">{name}</td>
{#if input instanceof inputs.NumberInput}
	<MPNumberInput
		bind:value={value as string | number}
    bind:refvalue={refvalue as string | number}
		numInput={input}
		{canEdit}
		{mps}
		{onchange}
	/>
{:else if input instanceof inputs.SelectInput}
	<td class="p-0 {hasChanged}" colspan="3"
		><select
			class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
			bind:value={value as string}
			disabled={!canEdit}
			onchange={() => onchange(value)}
		>
			{#each input.options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</td>
{:else if input instanceof inputs.BooleanInput}
	<td class="p-0 {hasChanged}" colspan="3">
		<input
			type="checkbox"
			class="btn-check"
			id="btn-check-{name}"
			autocomplete="off"
			onchange={(e) => {
				value = (e.target as HTMLInputElement).checked;
				onchange(value);
			}}
			checked={value as boolean}
			disabled={!canEdit}
		/>
		<label class="w-100 btn btn-sm btn-outline-secondary" for="btn-check-{name}">{value}</label>
	</td>
{:else if input instanceof inputs.RollInput}
	<RollInput
		bind:value={value as number | string | (number | string)[]}
		bind:refvalue={refvalue as number | string | (number | string)[]}
		rollInput={input}
		{canEdit}
		{mps}
    {onchange}
	/>
{:else}
	<td colspan="3">{name}({value})</td>
{/if}
