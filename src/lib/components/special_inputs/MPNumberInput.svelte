<script lang="ts">
	import * as inputs from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
	import EquationInput from './EquationInput.svelte';
	import MpInput from './MPInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import {
		type CombinationValue,
		type ComparisonValue,
		extractComboNdMps
	} from '$lib/schedules/aresti';

	let {
		value = $bindable(),
		refvalue,
		numInput,
		canEdit = false,
		mps,
		ndmps,
		onchange = () => {}
	}: {
		value: number | string | undefined;
		refvalue: number | string | undefined;
		numInput: inputs.NumberInput;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		ndmps: Record<string, CombinationValue | ComparisonValue>;
		onchange?: (newVal: number | string | undefined) => void;
	} = $props();

	const allowedMPS = Object.values(mps)
		.filter((mp) => mp.unit == numInput.unit)
		.map((mp) => mp.name);

	const comboNdMps = $state(extractComboNdMps(ndmps));

	let inputMode: string | undefined = $state(numInput.checkOption(value));
</script>

<td class="p-0"
	><select
		class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
		value={inputMode}
		disabled={!canEdit}
		onchange={(e) => {
			const oldInputMode = inputMode;
			inputMode = undefined;
			const newInputMode = (e.target as HTMLSelectElement).value;
			switch (newInputMode) {
				case 'MP':
					value = undefined;
					break;
				case 'value':
					if (oldInputMode == 'MP') {
						value = mps[value as string].defaul;
					} else {
						value = 0;
					}

					break;
				case 'eqn':
					value = `(${value}*1)`;
					break;
			}
			onchange(value);
			inputMode = newInputMode;
		}}
	>
		{#if allowedMPS.length + Object.keys(comboNdMps).length}
			<option value="MP">MP</option>
		{/if}
		<option value="value">value</option>
		<option value="eqn">eqn</option>
	</select></td
>
{#if inputMode == 'MP'}
	<MpInput
		bind:value={value as string | undefined}
		{refvalue}
		{numInput}
		{canEdit}
		{mps}
		{ndmps}
		{onchange}
	/>
{:else if inputMode == 'value'}
	<NumberInput
		bind:value={value as number}
		refvalue={refvalue as number | undefined}
		{numInput}
		{canEdit}
		{onchange}
	/>
{:else if inputMode == 'eqn'}
	<EquationInput
		bind:value={value as string}
		refvalue={refvalue as string | undefined}
		{numInput}
		{canEdit}
		{onchange}
		{mps}
	/>
{/if}
