<script lang="ts">
	export let group: string;
	export let value: string;
</script>

<button
	type="button"
	class="dropdown-item {group === value ? 'active' : ''}"
	data-bs-toggle="button"
	on:click={(e) => {
		e.stopPropagation();
		group = value;
	}}
>
	<slot />
</button>
