<script lang="ts">
	import { library } from '$lib/schedules/library';
	
	let {
		only_with_flights = false,
		category_name = undefined,
		onselected = (new_category_name: string) => {}
	}: {
		only_with_flights?: boolean;
		category_name?: string | undefined;
    schedule_name?: string | undefined;
		onselected: (new_category_name: string) => void;
	} = $props();

	const categories = $derived($library ? $library.unique('category_name') : undefined);

</script>

<select
	class="form-select text-center"
  value={category_name}
	onchange={(e: Event) => {
		if (e.target) {
      const new_category_name = (e.target as HTMLSelectElement).value;
			onselected(new_category_name);
		}
	}}
>
	{#if categories}{#each categories as cat}
			<option value={cat}>{cat}</option>
		{/each}{/if}
</select>
