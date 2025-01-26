<script lang="ts">
	import {
		type NumberInput,
		equals
	} from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';

	let {
		value = $bindable(),
		refvalue,
		numInput,
		canEdit = false,
		mps,
		onchange = () => {}
	}: {
		value: number | string;
		refvalue: number | string | undefined;
		numInput: NumberInput;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		onchange?: (newVal: number | string) => void;
	} = $props();

	const hasChanged = $derived(equals(value, refvalue) ? '' : 'table-warning');
</script>

<td class="p-0 {hasChanged}" colspan="2"
	><input
		class="w-100 form-control form-control-sm"
		type="text"
		bind:value
		disabled={!canEdit}
		onchange={() => onchange(value)}
	/></td
>
