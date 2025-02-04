<script lang="ts">

	import NumberInput from '$lib/manoeuvre/special_inputs/NumberInput.svelte';
	import * as inputs from '$lib/manoeuvre/special_inputs/inputs';
	import ArrayInput from '$lib/manoeuvre/special_inputs/ArrayInput.svelte';
	import type { ManBuilder } from '$lib/manoeuvre/builder.svelte';
	import { objmap } from '$lib/utils/arrays';

	let {
		newComps = $bindable(),
		oldComps,
    builder,
		canEdit,
		onchange = () => {}
	}: {
		newComps: Record<string, number >;
    oldComps: Record<string, number>;
    builder: ManBuilder;
		canEdit?: boolean;
		onchange?: (newParms: Record<string, number>) => void;
	} = $props();

	const comparisons: Record<string, number> = $derived(
		Object.fromEntries(
			Object.entries(builder.comparisonValues).map(([k, v]) => [k, (newComps[k] || v) as number])
		)
	);

//	let comboDefaults: Record<string, number> = $state(objmap(combinations, (v) => 0));
	let newComboName = $state('NewName');
</script>

<table class="table table-sm table-borderless">
	<tbody>
		<tr><td colspan="4"><small>Comparison Parameters</small></td></tr>
		{#each Object.keys(comparisons) as k}
			<tr class={comparisons[k] != builder.comparisonValues[k] ? 'table-active' : ''}>
				<td colspan="2" class="text-start overflow-hidden" style="max-width:150px">{k}</td>
				<NumberInput
					value={comparisons[k]}
					refvalue={(oldComps[k] || builder.parameters[k].defaul) as number | undefined}
					numInput={inputs.inputMap[k as keyof typeof inputs.inputMap] as inputs.NumberInput}
					{canEdit}
					onchange={(newval) => {
						newComps[k] = newval;
						onchange(newComps);
					}}
				/>
			</tr>
		{/each}
	</tbody>
</table>