<script lang="ts">
	import {
		type NumberInput,
		unitOptions,
		unitMultipliers
	} from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';

	let {
		value = $bindable(),
		numInput,
		canEdit = false,
		mps,
    onchange = () => {}
	}: {
		value: number | string;
		numInput: NumberInput;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
    onchange?: (newVal: number | string) => void;
	} = $props();

	let inputMode = $state(numInput.checkOption(value));

	const alternateUnits = $derived(unitOptions[numInput.unit]);

	const allowedMPS = Object.values(mps)
		.filter((mp) => mp.unit == numInput.unit)
		.map((mp) => mp.name);

	// svelte-ignore state_referenced_locally
	let selectedUnit = $state(alternateUnits[0]);

	const multiplier = $derived(unitMultipliers[selectedUnit as keyof typeof unitMultipliers]);

	// svelte-ignore state_referenced_locally
	let rawValue = $state(typeof value == 'number' ? value / multiplier : value);

</script>

<td class="p-0"
	><select
		class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
		bind:value={inputMode}
		disabled={!canEdit}
		onchange={() => {
			if (typeof value === 'string' && Object.keys(mps).includes(value)) {
				value = mps[value].defaul;
        onchange(value);
			}
			rawValue = typeof value == 'number' ? value / multiplier : value;
		}}
	>
		<option value="MP">MP</option>
		<option value="value">value</option>
		<option value="eqn">eqn</option>
	</select></td
>
{#if inputMode == 'MP'}
	<td class="p-0"
		><select
			class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
			bind:value
			disabled={!canEdit}
      onchange={()=>onchange(value)}
		>
			{#each allowedMPS as mp}
				<option value={mp}>{mp}</option>
			{/each}
		</select></td
	>
{:else if inputMode == 'value'}
	<td class="p-0"
		><input
			class="w-100 form-control form-control-sm"
			type="number"
			step={numInput.step / multiplier}
			bind:value={rawValue}
			onchange={() => {value = (rawValue as number) * multiplier; onchange(value);}}
			disabled={!canEdit}
		/></td
	>
	<td class="p-0"
		><select
			class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
			bind:value={selectedUnit}
			onchange={() => {
				rawValue = (value as number) / multiplier;
			}}
		>
			{#each alternateUnits as ug}
				<option value={ug}>{ug}</option>
			{/each}
		</select></td
	>
{:else if inputMode == 'eqn'}
	<td class="p-0" colspan="2"
		><input
			class="w-100 form-control form-control-sm"
			type="text"
			bind:value
			disabled={!canEdit}
      onchange={()=>onchange(value)}
		/></td
	>
{/if}
