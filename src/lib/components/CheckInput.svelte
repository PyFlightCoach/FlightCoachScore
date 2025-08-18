<script lang="ts">
	let {
		name = '',
		checked = $bindable()
	}: { name: string; checked: boolean | undefined } = $props();
</script>

<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class="form-check-input"
		{name}
		bind:checked
	/>
	<label for="truncate">{name}</label>
</div>
