<script lang="ts">
	import { library } from '$lib/schedules.js';
	import { schedule_id } from '$lib/stores/leaderboards';
	import { onMount } from 'svelte';

	let {
		only_with_flights = false,
		category_name = undefined,
		schedule_name = undefined,
		onselected = (new_schedule_name: string) => {}
	}: {
		only_with_flights?: boolean;
		category_name: string | undefined;
		schedule_name?: string | undefined;
		onselected: (new_schedule_name: string) => void;
	} = $props();

	const schedules = $derived(
		$library && category_name ? $library.subset({ category_name }).unique('schedule_name') : []
	);

</script>

<select
	class="form-select text-center"
  value={schedule_name}
	onchange={(e: Event) => {
		if (e.target) {
			onselected((e.target as HTMLSelectElement).value);
		}
	}}
>
	{#if schedules}{#each schedules as sch}
			<option value={sch}>{sch}</option>
		{/each}{/if}
</select>
