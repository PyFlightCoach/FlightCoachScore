<script lang="ts">
	let {
		options,
		value = $bindable(),
		canEdit = $bindable(false),
		undefValue = 'Select',
    refValue = $bindable()
	}: {
		options: string[];
		value: string | undefined;
		canEdit?: boolean;
		undefValue?: string;
    refValue?: string | undefined | null;
	} = $props();

  const checkValue = $derived(refValue === null ? value : refValue);

</script>

<select
	class="form-select text-center {checkValue != value ? 'bg-warning' : ''}"
	disabled={!canEdit}
	value={value || undefValue}
	onchange={(e) => {
		const rawValue = (e.target as HTMLSelectElement).value;
		value = rawValue != undefValue ? rawValue : undefined;
	}}
>
	{#each [...options, undefValue] as opt}
		<option value={opt}>{opt}</option>
	{/each}
</select>
