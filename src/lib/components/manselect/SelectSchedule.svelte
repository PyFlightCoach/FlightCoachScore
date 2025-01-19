<script lang="ts">
	import { type ScheduleLibrary } from '$lib/schedules/library';
	import { type DBSchedule } from '$lib/database/interfaces';

	const {
    library,
		schedule_id=undefined,
		onselected = () => {}
	}: {
    library: ScheduleLibrary;
		schedule_id?: string | undefined;
		onselected?: (category_name: string | undefined, schedule: DBSchedule | undefined) => void;
	} = $props();

	const categories = $derived(library.unique('category_name'));

	let selectedCategory: string | undefined = $state(
		library.subset({ schedule_id: schedule_id }).first?.category_name
	);

	let schedules = $derived(
		library.subset({ category_name: selectedCategory! }).unique('schedule_name')
	);

	let selectedSchedule: string | undefined = $state(
		library.subset({ schedule_id: schedule_id }).first?.schedule_name
	);
</script>

<div class="row p-2">
	<label class="col col-form-label" for="version">Category</label>
	<select
		class="col form-select text-center"
		value={selectedCategory}
		onchange={(e) => {
      selectedCategory = e.target.value;
      selectedSchedule = undefined;
			onselected(
				selectedCategory,
				undefined
			);
		}}
	>
		{#each categories as cat}
			<option value={cat}>{cat}</option>
		{/each}
	</select>
</div>

<div class="row p-2">
	<label class="col col-form-label" for="version">Schedule</label>
	<select
		class="col form-select text-center"
		bind:value={selectedSchedule}
		onchange={(e) => {
			onselected(
				selectedCategory,
				library.subset({ category_name: selectedCategory, schedule_name: selectedSchedule }).first
			);
		}}
	>
		{#each schedules as sch}
			<option value={sch}>{sch}</option>
		{/each}
	</select>
</div>
