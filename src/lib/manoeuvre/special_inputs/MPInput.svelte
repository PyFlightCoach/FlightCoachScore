<script lang="ts">
	import { type NumberInput, equals } from './inputs';
	import type { MPValue } from '$lib/manoeuvre/definition.svelte';
	import { objfilter } from '$lib/utils/arrays';

	let {
		value = $bindable(),
		refvalue,
		numInput,
		canEdit = false,
		mpValues,
		onchange = () => {}
	}: {
		value: string | undefined;
		refvalue: number | string | undefined;
		numInput: NumberInput;
		canEdit?: boolean;
		mpValues: Record<string, MPValue>;
		onchange?: (newVal: string | undefined) => void;
	} = $props();

  const allowedMPS = $derived(objfilter(mpValues, (_, v)=>v.unit==numInput.unit));

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
		{#each Object.keys(allowedMPS) as mp}
			<option value={mp}>{mp}</option>
		{/each}
	</select></td
>
