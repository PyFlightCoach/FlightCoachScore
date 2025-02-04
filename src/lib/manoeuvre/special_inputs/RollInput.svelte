<script lang="ts">
	import * as inputs from './inputs';
	import type { ManParm, MPValue } from '$lib/manoeuvre/definition.svelte';
	import ArrayInput from './ArrayInput.svelte';
	import MpInput from './MPInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import { objfilter } from '$lib/utils/arrays';

	let {
		value = $bindable(),
		refvalue,
		rollInput,
		canEdit = false,
		mpValues,
		onchange = () => {}
	}: {
		value: number | string | (number | string)[];
		refvalue: number | string | (number | string)[] | undefined;
		rollInput: inputs.RollInput;
		canEdit?: boolean;
		mpValues: Record<string, MPValue>;
		onchange?: (newVal: number | string | (number | string)[]) => void;
	} = $props();

	const hasChanged = $derived(inputs.equals(value, refvalue) ? '' : 'table-warning');

	let inputMode = $state(rollInput.checkOption(value) || 'value');

	let isValidPointRoll = $derived(
		inputMode == 'point' ? inputs.re_point_roll.test(value as string) : true
	);
  
  const allowedMPS = $derived(objfilter(mpValues, (v)=>v.unit=='rad'));

</script>

<td class="p-0"
	><select
		class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
		value={inputMode}
		disabled={!canEdit}
		onchange={(e) => {
			const oldInputMode = rollInput.checkOption(value);
			const newInputMode = (e.target as HTMLSelectElement).value;
			console.log(`switch from ${inputMode} to ${newInputMode}`);
			switch (newInputMode) {
				case 'MP':
					if (Array.isArray(value) && typeof value[0] === 'string') {
						value = value[0];
					} else {
						value = 0;
					}
					break;
				case 'value':
					if (Array.isArray(value) && typeof value[0] === 'number') {
						value = value[0];
					} else {
						value = 0;
					}
					break;
				case 'point':
					value = '2x2';
					break;
				case 'array':
					if (['value', 'MP'].includes(oldInputMode as string)) {
						value = [(value as string | number) || 0];
					} else {
						const newValue = [];
						const angle = (2 * Math.PI) / parseInt((value as string).slice(-1));
						for (let i = 0; i < parseInt((value as string).slice(0)); i++) {
							newValue.push(angle);
						}
						value = newValue;
					}
					break;
			}
			inputMode = newInputMode;
		}}
	>
		{#if allowedMPS.length}
			<option value="MP">MP</option>
		{/if}
		<option value="value">value</option>
		<option value="point">point</option>
		<option value="array">array</option>
	</select></td
>
{#if inputMode == 'MP'}
	<MpInput
		bind:value={value as string | undefined}
		refvalue={refvalue as string | undefined}
		numInput={new inputs.NumberInput('rad', Math.PI / 4)}
		{canEdit}
		{mpValues}
		onchange={(newVal) => onchange(newVal as string)}
	/>
{:else if inputMode == 'value'}
	<NumberInput
		value={value as number}
		refvalue={refvalue as number | undefined}
		numInput={new inputs.NumberInput('rad', Math.PI / 4, 'Enter a value in radians')}
		{canEdit}
		{onchange}
	/>
{:else if inputMode == 'point'}
	<td class="p-0 {hasChanged}" colspan="2"
		><input
			class="form-control form-control-sm text-center {isValidPointRoll ? '' : 'bg-danger'}"
			type="text"
			maxlength="3"
			bind:value
			disabled={!canEdit}
			onchange={() => onchange(value)}
			title={rollInput.description}
		/>
	</td>
{:else if inputMode == 'array'}
	<ArrayInput
		bind:value={value as (number | string)[]}
		refvalue={refvalue as (number | string)[] | undefined}
		input={rollInput}
		{canEdit}
		{onchange}
	/>
{/if}
