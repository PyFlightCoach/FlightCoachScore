<script lang="ts">
	import {
		type RollInput,
		unitOptions,
		unitMultipliers,
		re_point_roll
	} from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
  
	let {
		value = $bindable(),
    refvalue = $bindable(),
		rollInput,
		canEdit = false,
		mps,
    onchange = () => {}
	}: {
		value: number | string | (number | string)[];
    refvalue: number | string | (number | string)[];
		rollInput: RollInput;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
    onchange?: (newVal: number | string | (number | string)[]) => void;
	} = $props();

  const hasChanged = $derived.by(()=>{
    if (Array.isArray(value)) {
      return value.every((v,i)=>v==(refvalue as (string|number)[])[i]) ? '' : 'table-warning'
    } else {
      return value != refvalue ? 'table-warning' : ''
    }
  });

	let inputMode = $state(rollInput.checkOption(value));

	const alternateUnits = unitOptions.rad;
	let selectedUnit = $state(alternateUnits[0]);
	const multiplier = $derived(unitMultipliers[selectedUnit as keyof typeof unitMultipliers]);

	// svelte-ignore state_referenced_locally
	let rawValue = $state(typeof value == 'number' ? value / multiplier : value);

	let isValidPointRoll = $derived(
		inputMode == 'point' ? re_point_roll.test(value as string) : true
	);

	const allowedMPS = Object.values(mps)
		.filter((mp) => mp.unit == 'rad')
		.map((mp) => mp.name);
</script>

<td class="p-0 {hasChanged}"
	><select
		class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
		bind:value={inputMode}
		disabled={!canEdit}
	>
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
		>
			{#each allowedMPS as mp}
				<option value={mp}>{mp}</option>
			{/each}
		</select></td
	>
{:else if inputMode == 'value'}
	<td class="p-0  {hasChanged}"
		><input
			class="w-100 form-control form-control-sm"
			type="number"
			step={Math.PI / (4 * multiplier)}
			bind:value={rawValue}
			onchange={() => {value = (rawValue as number) * multiplier; onchange(value);}}
			disabled={!canEdit}
		/></td
	>
	<td class="p-0  {hasChanged}"
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
	<td class="p-0  {hasChanged}" colspan="2"
		><input
			class="form-control form-control-sm text-center {isValidPointRoll ? '' : 'bg-danger'}"
			type="text"
			maxlength="3"
			bind:value
      disabled={!canEdit}
      onchange={() => onchange(value)}
		/>
	</td>
{/if}
