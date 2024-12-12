<script lang="ts">
	import { safeGetLibrary, ScheduleLibrary } from '$lib/schedules.js';
	import {
    n_results,
		n_days_val,
		me_only_flag,
		difficulty,
		truncate,
		schedule_id,
		one_per_pilot_flag,
		sort_by_score_flag,
		select_by_date,
		date_after,
		date_before,
    version,
    manoeuvre_ind,
    singleman,
    getDays
	} from '$lib/stores/leaderboards';

	export let fa_versions: string[];


	let library: ScheduleLibrary | undefined;
	let categories: string[] = [];
	let selectedCategory: string | undefined;
	let schedules: string[] = [];
	let selectedSchedule: string | undefined;

	$: categories = library?.unique('category_name') || [];

	$: schedules = selectedCategory
			? library?.subset({ category_name: selectedCategory }).unique('schedule_name')
			: [];

  $: if (selectedCategory &&  library && selectedSchedule) {
		$schedule_id = library.subset({
			category_name: selectedCategory,
			schedule_name: selectedSchedule
		}).first?.schedule_id;
	}

	safeGetLibrary().then((lib) => {
		library = lib;
		selectedCategory = $schedule_id
			? library?.subset({ schedule_id: $schedule_id }).first?.category_name
			: undefined;

		selectedSchedule =
			$schedule_id && library
				? library?.subset({ schedule_id: $schedule_id }).first?.schedule_name
				: undefined;
	});

	$: n_days = { 0: 1, 370: 720, 380: 10000 }[$n_days_val] || $n_days_val;

	$: if (n_days) {
		$date_before = new Date().toISOString().split('T')[0]; // restrict to flights before this date yyyy-mm-dd
		$date_after = new Date(new Date().getTime() - 24 * getDays(n_days) * 3600 * 1000)
			.toISOString()
			.split('T')[0]; // restrict to flights after this date yyyy-mm-dd
	}



</script>


<div class="p-2 row ">
  <button class="col btn btn-outline-secondary {$sort_by_score_flag ? 'active' : ''}" on:click={()=>{$sort_by_score_flag=true}}>Leaderboard</button>
  <button class="col btn btn-outline-secondary {$sort_by_score_flag ? '' : 'active'}" on:click={()=>{$sort_by_score_flag=false}}>History</button>
</div>

<div class="row p-2">
	<label class="col col-form-label" for="version">Version</label>
	<select
		class="col form-select text-center"
		id="version"
		name="version"
		required
		bind:value={$version}
	>
		{#each fa_versions as ver}
			<option value={ver}>{ver}</option>
		{/each}
	</select>
</div>

<div class="row p-2">
	<label class="col col-form-label" for="version">Category</label>
	<select class="col form-select text-center" bind:value={selectedCategory}>
		{#each categories as cat}
			<option value={cat}>{cat}</option>
		{/each}
	</select>
</div>

<div class="row p-2">
	<label class="col col-form-label" for="version">Schedule</label>
	<select class="col form-select text-center" bind:value={selectedSchedule}>
		{#each schedules as sch}
			<option value={sch}>{sch}</option>
		{/each}
	</select>
</div>

<div class="row p-2">
	<label class="col col-form-label" for="difficulty">Difficulty</label>
	<select
		id="difficulty"
		class="col form-select text-center"
		name="difficulty"
		required
		bind:value={$difficulty}
	>
		<option value={3}>Hard</option>
		<option value={2}>Moderate</option>
		<option value={1}>Easy</option>
	</select>
</div>

<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class="form-check-input"
		id="truncate"
		name="truncate"
		bind:checked={$truncate}
	/>
	<label for="truncate">Truncate</label>
</div>


<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class="form-check-input"
		id="me_only_flag"
		name="me_only_flag"
		bind:checked={$me_only_flag}
	/>
	<label for="form-check-label">Only my flights</label>
</div>

{#if $sort_by_score_flag}
<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class="form-check-input"
		id="one_per_pilot_flag"
		name="one_per_pilot_flag"
		bind:checked={$one_per_pilot_flag}
	/>
	<label for="one_per_pilot_flag">Only best flight from each pilot</label>
</div>
{/if}

<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class="form-check-input"
		id="wholeflight"
		name="truncate"
		bind:checked={$singleman}
	/>
	<label for="wholeflight">Single Manoeuvre</label>
</div>

{#if $singleman}
	<div class="row p-2 px-4">
		<label class="col col-form-label text-nowrap" for="manoeuvre_ind">Manoeuvre Number</label>
		<input
			type="number"
			class="col form-control text-center"
			id="manoeuvre_ind"
			name="manoeuvre_ind"
			min="1"
			bind:value={$manoeuvre_ind}
		/>
	</div>
{/if}

<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class="form-check-input"
		id="select_by_date"
		name="select_by_date"
		bind:checked={$select_by_date}
	/>
	<label class="form-check-label" for="select_by_date">Select By Dates</label>
</div>
{#if $select_by_date}
	<div class="row">
		<div class="col p-2">
			<label for="startDate">Start</label>
			<input id="startDate" class="form-control" type="date" bind:value={$date_after} />
		</div>
		<div class="col p-2">
			<label for="endDate">End</label>
			<input id="endDate" class="form-control" type="date" bind:value={$date_before} />
		</div>
	</div>
{:else}
	<div class="p-2">
		<label for="n_days">Limit to flights in the last {n_days} days</label>
		<input
			type="range"
			class="form-range"
			bind:value={$n_days_val}
			id="n_days"
			name="n_days"
			min="0"
			max="380"
			step="10"
		/>
	</div>
{/if}

