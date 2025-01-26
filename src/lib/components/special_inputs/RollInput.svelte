<script lang="ts">
	import {
		type RollInput as RInp,
		unitOptions,
		unitMultipliers,
		re_point_roll,
		equals,
	} from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
	import ArrayInput from './ArrayInput.svelte';
	import MpNumberInput from './MPNumberInput.svelte';

	let {
		value = $bindable(),
		refvalue,
		rollInput,
		canEdit = false,
		mps,
		onchange = () => {}
	}: {
		value: number | string | (number | string)[];
		refvalue: number | string | (number | string)[] | undefined;
		rollInput: RInp;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		onchange?: (newVal: number | string | (number | string)[]) => void;
	} = $props();

	const hasChanged = $derived(equals(value, refvalue) ? '' : 'table-warning');

	let inputMode = $state(rollInput.checkOption(value) || 'value');

	const alternateUnits = unitOptions.rad;
	let selectedUnit = $state(alternateUnits[0]);
	const multiplier = $derived(unitMultipliers[selectedUnit as keyof typeof unitMultipliers]);

	// svelte-ignore state_referenced_locally
	let rawValue = $state(typeof value == 'number' ? value / multiplier : value);

	let isValidPointRoll = $derived(
		inputMode == 'point' ? re_point_roll.test(value as string) : true
	);

	const allowedMPS = Object.values(mps)
		.filter((mp) => mp.criteria.kind == 'combination')
		.map((mp) => mp.name);

</script>

<td class="p-0"
	><select
		class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
		value={inputMode}
		disabled={!canEdit}
		onchange={(e) => {
			const old_mode = rollInput.checkOption(value);
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
					if (['value', 'MP'].includes(old_mode as string)) {
						value = [value as string | number];
					} else {
            const newValue = [];
            const angle = (2 * Math.PI / parseInt((value as string).slice(-1)))
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
	<td class="p-0 {hasChanged}"
		><select
			class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
			bind:value
			onchange={() => onchange(value)}
			disabled={!canEdit}
      title={rollInput.description}
		>
			{#each allowedMPS as mp}
				<option value={mp}>{mp}</option>
			{/each}
		</select></td
	>
{:else if inputMode == 'value'}
	<td class="p-0 {hasChanged}"
		><input
			class="w-100 form-control form-control-sm"
			type="number"
			step={Math.PI / (4 * multiplier)}
			bind:value={rawValue}
			onchange={() => {
				value = (rawValue as number) * multiplier;
				onchange(value);
			}}
			disabled={!canEdit}
      title={rollInput.description}
		/></td
	>
	<td class="p-0 {hasChanged}"
		><select
			class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
			bind:value={selectedUnit}
			onchange={() => {
				rawValue = (value as number) / multiplier;
			}}
			disabled={!canEdit}
		>
			{#each alternateUnits as ug}
				<option value={ug}>{ug}</option>
			{/each}
		</select></td
	>
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
		{mps}
		{onchange}
	/>
{/if}
