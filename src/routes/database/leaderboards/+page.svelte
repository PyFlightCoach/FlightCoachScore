<script lang="ts">
	import { dbServer, faVersion } from '$lib/api.js';
	import ScheduleSelect from '$lib/components/ScheduleSelect.svelte';
	import { n_days_val, n_results, me_only_flag, difficulty, truncate, schedule_id, one_per_pilot_flag} from '$lib/stores/leaderboards';
	export let data;

	$: n_days = { 0: 1, 370: 720, 380: 10000 }[$n_days_val] || $n_days_val;

	let col_heads = ['Position', 'Rank', 'Name', 'Country', 'Date', 'Score'];
	let table_rows: {
		table_rank: number;
		rank: number;
		name: string;
		country: string;
		date: Date;
		score: number;
	}[] = [];

	let date_after = new Date(new Date().getTime() - (n_days || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
	let date_before = new Date().toISOString().split('T')[0];
	let version = faVersion;
	let schedule_name: string = 'select schedule';
  let manoeuvre_ind: number | undefined = undefined;

  const submit = async () => {
		const q = {
			...{
				n_results:$n_results,
				date_after,
				date_before,
				me_only_flag:$me_only_flag,
				difficulty:$difficulty,
				truncate:$truncate,
				schedule_id:$schedule_id,
			  one_per_pilot_flag:$one_per_pilot_flag,
				version
			},
			...(manoeuvre_ind ? { manoeuvre_ind } : {})
		};
    console.log(q);
		dbServer.get('analysis/leaderboard', q).then(res=>{table_rows=res.results});
	};

</script>

<div class="col-3 bg-light pt-5">
	
		<div class="mt-2 mb-3">
			<input
				type="checkbox"
				class="form-check-input"
				id="me_only_flag"
				name="me_only_flag"
				bind:checked={$me_only_flag}
			/>
			<label for="me_only_flag">Only my flights</label>
		</div>
		<div class="mb-3">
			<input
				type="checkbox"
				class="form-check-input"
				id="one_per_pilot_flag"
				name="one_per_pilot_flag"
				bind:checked={$one_per_pilot_flag}
			/>
			<label for="one_per_pilot_flag">Only best flight for each pilot</label>
		</div>
		<div class="mb-3">
			<label for="version">Schedule</label>
			<button class="form-select" data-bs-toggle="dropdown">{schedule_name}</button>
			<ScheduleSelect
				level="schedule"
				onselected={(schedule, manoeuvre) => {
					console.log(`selecting: ${schedule.schedule_name}`);
					$schedule_id = schedule.schedule_id;
					schedule_name = `${schedule.category_name} ${schedule.schedule_name}`;
				}}
			/>
		</div>
		<div class="mb-3">
			<label for="version">FA Version</label>
			<select class="form-select" id="version" name="version" required bind:value={version}>
				{#each data.fa_versions as ver, i}
					<option value={ver}>{ver}</option>
				{/each}
			</select>
		</div>
		<div class="mb-3">
			<label for="difficulty">Difficulty</label>
			<select
				class="form-select"
				id="difficulty"
				name="difficulty"
				required
				bind:value={$difficulty}
			>
				<option value={3}>Hard</option>
				<option value={2}>Moderate</option>
				<option value={1}>Easy</option>
			</select>
		</div>
		<div class="mb-3">
			<input
				type="checkbox"
				class="form-check-input"
				id="truncate"
				name="truncate"
				bind:checked={$truncate}
			/>
			<label for="truncate">Truncate</label>
		</div>
		<div class="mb-3">
			<label for="manoeuvre_ind">Manoeuvre Number</label>
			<input
				type="number"
				class="form-control"
				id="manoeuvre_ind"
				name="manoeuvre_ind"
				placeholder="Use Flight Score"
				min="1"
				bind:value={manoeuvre_ind}
			/>
		</div>
		<div class="mb-3">
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
		<button class="btn btn-primary" on:click={submit}>Submit</button>
</div>

<div class="col">
  <div class="mh-100 overflow-scroll">
	<table class="table table-sm table-success table-striped text-center">
		<thead class="table-dark sticky-top" style="z-index:-1">
			<tr>
				{#each col_heads as col_head}
					<th scope="col">{col_head}</th>
				{/each}
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each table_rows as row}
				<tr>
					<td>{row.table_rank}</td>
					<td>{row.rank}</td>
					<td>{row.name}</td>
					<td>{row.country}</td>
					<td>{row.date}</td>
					<td>{row.score}</td>
					<td>View</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
</div>
