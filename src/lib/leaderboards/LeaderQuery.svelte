<script lang="ts">
	import { library } from '$lib/schedule/library';
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
		getDays,
		includeMyBest,
		includeMyLatest,
		includeActive,
		getNFlights
	} from '$lib/leaderboards/stores';
	import { activeFlight } from '$lib/stores/shared';
  import CheckInput from '$lib/components/CheckInput.svelte';
	
  let { fa_versions, schedule_ids }: { fa_versions: string[]; schedule_ids: string[] } = $props();

	let lib = $derived(schedule_ids ? $library.downselect(schedule_ids) : $library);
	let categories = $derived(lib.unique('category_name') || []);
	let selectedCategory: string | undefined = $state(categories[0]);
	let schedules = $derived(
		selectedCategory ? lib?.subset({ category_name: selectedCategory }).unique('schedule_name') : []
	);

	$effect(() => {
		selectedCategory = $schedule_id
			? lib.subset({ schedule_id: $schedule_id }).first?.category_name
			: categories[0];
	});

	let selectedSchedule: string | undefined = $state();

	$effect(() => {
		selectedSchedule = $schedule_id
			? lib.subset({ schedule_id: $schedule_id }).first?.schedule_name
			: schedules[0];
	});

	let n_days = $derived({ 0: 1, 370: 720, 380: 10000 }[$n_days_val] || $n_days_val);

	$effect(() => {
		if (n_days && !$select_by_date) {
			$date_before = new Date().toISOString().split('T')[0]; // restrict to flights before this date yyyy-mm-dd
			$date_after = new Date(new Date().getTime() - 24 * getDays(n_days) * 3600 * 1000)
				.toISOString()
				.split('T')[0];
		}
	});
</script>

<div class="p-2 row">
	<button
		class="col btn btn-outline-secondary {$sort_by_score_flag ? 'active' : ''}"
		onclick={() => {
			$sort_by_score_flag = true;
		}}>Leaderboard</button
	>
	<button
		class="col btn btn-outline-secondary {$sort_by_score_flag ? '' : 'active'}"
		onclick={() => {
			$sort_by_score_flag = false;
		}}>History</button
	>
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
	<select
		class="col form-select text-center"
		bind:value={selectedSchedule}
		onchange={(e) => {
			const value = (e.target as HTMLSelectElement).value;
			if (selectedCategory && value) {
				$schedule_id = lib.subset({ category_name: selectedCategory, schedule_name: value }).first
					?.schedule_id;
			}
		}}
	>
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

<CheckInput name="truncate" bind:checked={$truncate}/>
<CheckInput name="Only my flights" bind:checked={$me_only_flag}/>

{#if $sort_by_score_flag}
  <CheckInput name="Only best flight from each pilot" bind:checked={$one_per_pilot_flag}/>
{/if}

{#if $sort_by_score_flag}
  <CheckInput name="Single Manoeuvre" bind:checked={$singleman}/>
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
{/if}
<CheckInput name="Select By Dates" bind:checked={$select_by_date}/>

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

<div class="row p-2">
	<label class="col col-form-label" for="nflights"
		>Include the top {getNFlights($n_results)} results:</label
	>
	<input
		type="range"
		class="form-range"
		bind:value={$n_results}
		id="nflights"
		name="n_flights"
		min="1"
		max="102"
		step="1"
	/>
</div>

{#if $sort_by_score_flag}
	<div class="row p-2">
		<div class="row"><label class="col col-form-label" for="version">Include My:</label></div>
		<div class="btn-group">
			<input
				type="checkbox"
				class="btn-check"
				id="incBest"
				autocomplete="off"
				checked={$includeMyBest > 0}
				onchange={(e) => {
					$includeMyBest = (e.target as HTMLInputElement).checked ? 1 : 0;
				}}
			/>
			<label class="btn btn-outline-secondary" for="incBest" title="Include your best flight"
				>Best</label
			>
			<input
				type="checkbox"
				class="btn-check"
				id="incLatest"
				autocomplete="off"
				checked={$includeMyLatest > 0}
				onchange={(e) => {
					$includeMyLatest = (e.target as HTMLInputElement).checked ? 1 : 0;
				}}
			/>
			<label class="btn btn-outline-secondary" for="incLatest" title="Include your latest flight"
				>Latest</label
			>
			<input
				type="checkbox"
				class="btn-check"
				id="incActive"
				autocomplete="off"
				checked={$includeActive > 0 && $activeFlight?.isMine}
				onchange={(e) => {
					$includeActive = (e.target as HTMLInputElement).checked ? 1 : 0;
				}}
			/>
			<label
				class="btn btn-outline-secondary {$activeFlight?.isMine ? '' : 'disabled'}"
				for="incActive"
				title="Include the active flight if it is yours">Active</label
			>
		</div>
	</div>
{/if}
