<script lang="ts">
	let {
		options,
		value = $bindable(),
		canEdit = $bindable(false)
	}: { options: string[]; value: string; canEdit?: boolean } = $props();
</script>

<select class="form-select text-center" disabled={!canEdit} bind:value>
	{#each options as opt}
		<option value={opt}>{opt}</option>
	{/each}
</select>
