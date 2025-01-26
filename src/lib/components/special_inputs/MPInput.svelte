<script lang="ts">
	import { type NumberInput, equals } from '$lib/components/special_inputs/inputs';
	import {type CombinationValue, type ComparisonValue, extractComboNdMps } from '$lib/schedules/aresti';
	import type { ManParm } from '$lib/schedules/mandef';

	let {
		value = $bindable(),
		refvalue,
		numInput,
		canEdit = false,
		mps,
		ndmps,
		onchange = () => {}
	}: {
		value: string | undefined;
		refvalue: number | string | undefined;
		numInput: NumberInput;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		ndmps: Record<string, CombinationValue | ComparisonValue>;
		onchange?: (newVal: string | undefined) => void;
	} = $props();

	const allowedMPS = Object.values(mps)
		.filter((mp) => mp.unit == numInput.unit)
		.map((mp) => mp.name);
  
  const comboNdMps = $state(extractComboNdMps(ndmps));
	const hasChanged = $derived(equals(value, refvalue) ? '' : 'table-warning');
</script>

<td class="p-0 {hasChanged}"
	><select
		class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
		value={value || 'Select MP'}
		disabled={!canEdit}
		onchange={(e) => {
			const val = (e.target as HTMLSelectElement).value;
			value = val == 'Select MP' ? undefined : val;
			onchange(value);
		}}
		title={numInput.description}
	>
		<option value="Select MP" disabled>Select MP</option>
		{#each allowedMPS as mp}
			<option value={mp}>{mp}</option>
		{/each}
		{#each Object.entries(comboNdMps) as [k, mp]}
			{#each mp as v, i}
				<option value="{k}[{i}]">{k}[{i}]</option>
			{/each}
		{/each}
	</select></td
>
