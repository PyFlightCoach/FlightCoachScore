<script lang="ts">
	let {
		options,
		value = $bindable(),
		canEdit = $bindable(false),
		undefValue,
    refValue = $bindable()
	}: {
		options: string[];
		value: string | undefined;
		canEdit?: boolean;
		undefValue?: string | undefined;
    refValue?: string | undefined | null;
	} = $props();
  
</script>

<select
	class="form-select text-center"
  class:bg-warning={value != refValue && refValue !== undefined}
	disabled={!canEdit}
	value={value || undefValue}
	onchange={(e) => {
		const rawValue = (e.target as HTMLSelectElement).value;
		value = rawValue != undefValue ? rawValue : undefined;
	}}
>
	{#each [...options, ...(undefValue ? [undefValue] : [])] as opt}
		<option value={opt} class:bg-light={(refValue || undefValue) == opt}>{opt}</option>
	{/each}
</select>
