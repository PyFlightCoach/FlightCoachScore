<script lang="ts">
	import * as inputs from './inputs';
	import type {  MPValue } from '$lib/manoeuvre/definition.svelte';
	import EquationInput from './EquationInput.svelte';
	import MpInput from './MPInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import { objfilter } from '$lib/utils/arrays';

	let {
		value = $bindable(),
		refvalue,
		numInput,
		canEdit = false,
		mpValues,
		onchange = () => {}
	}: {
		value: number | string | undefined;
		refvalue: number | string | undefined;
		numInput: inputs.NumberInput;
		canEdit?: boolean;
		mpValues: Record<string, MPValue>;
		onchange?: (newVal: number | string | undefined) => void;
	} = $props();

	const allowedMPS = $derived(objfilter(mpValues, (_, v)=>v.unit==numInput.unit));
  
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
						value = mpValues[value as string].value;
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
		{#if Object.keys(allowedMPS).length }
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
		mpValues={allowedMPS}
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
		mpValues={allowedMPS}
	/>
{/if}
