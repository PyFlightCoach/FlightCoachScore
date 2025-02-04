<script lang="ts">
	import {
		type NumberInput,
		equals
	} from './inputs';
  import {unitOptions,
		unitMultipliers} from '$lib/utils/units';
    
	let {
		value = $bindable(),
		refvalue,
		numInput,
		canEdit = false,
		onchange = () => {}
	}: {
		value: number;
		refvalue: number | undefined;
		numInput: NumberInput;
		canEdit?: boolean;
		onchange?: (newVal: number) => void;
	} = $props();

	const alternateUnits = $derived(unitOptions[numInput.unit]);

	// svelte-ignore state_referenced_locally
	let selectedUnit = $state(alternateUnits ? alternateUnits[0] : undefined);

	const multiplier = $derived(selectedUnit ? unitMultipliers[selectedUnit as keyof typeof unitMultipliers] : 1);

	// svelte-ignore state_referenced_locally
	let rawValue = $state(typeof value == 'number' ? value / multiplier : value);

	const hasChanged = $derived(equals(value, refvalue) ? '' : 'table-warning');
</script>

<td class="p-0 {hasChanged}"
	><input
		class="w-100 form-control form-control-sm text-center"
		type="number"
		step={numInput.step / multiplier}
		bind:value={rawValue}
		onchange={() => {
			value = (rawValue as number) * multiplier;
			onchange(value);
		}}
		disabled={!canEdit}
		title={numInput.description}
	/></td
>
<td class="p-0 {hasChanged}"
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
