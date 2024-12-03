<script lang="ts">
	import { dbServer } from '$lib/api.js';
	import ScheduleSelect from '$lib/components/ScheduleSelect.svelte';
	import { library, loadKnowns, scheduleRepr } from '$lib/schedules.js';
	import {
		n_days_val,
		n_results,
		me_only_flag,
		difficulty,
		truncate,
		schedule_id,
		one_per_pilot_flag,
    sort_by_score_flag,
    select_by_date,
    date_after,
    date_before
	} from '$lib/stores/leaderboards';
	import { user } from '$lib/stores/user.js';
	export let data;

	loadKnowns();

	$: n_days = { 0: 1, 370: 720, 380: 10000 }[$n_days_val] || $n_days_val;
  
  let lastResponse: 'leaderboard' | 'flightlist' | undefined = undefined;

  let col_map = {
    id: "flight_id",
    lat: "origin_lat",
    lng: "origin_lng",
    Name: "name",
    Country: "country",
    Date: "date",
    Comment: "comment",
    Rank: "rank",
    Position: "table_rank",
    Score: "score",
    Version: "version",
  }

  let col_heads: string[];
	$: if (lastResponse=='leaderboard') {
    col_heads = ['Position', 'Rank', 'Name', 'Country', 'Date', 'Score'];
  } else if (lastResponse=='flightlist') {
    col_heads = [...['Date', 'Score', 'Comment'], ...($user?.is_superuser ? ['Name'] :[])];
  }
	let table_rows: {
		table_rank: number;
		rank: number;
		name: string;
		country: string;
		date: Date;
		score: number;
	}[] = [];

  $: if (n_days) {
    $date_before = new Date().toISOString().split('T')[0];  // restrict to flights before this date yyyy-mm-dd
    $date_after = new Date(new Date().getTime() - 24 * n_days *3600*1000).toISOString().split('T')[0]; // restrict to flights after this date yyyy-mm-dd
  }

  $: console.log(n_days);
  $: console.log($date_after);
  $: console.log($date_before);
	
  let schedule_name: string = 'Select Schedule'
  $: if ($schedule_id) {schedule_name = scheduleRepr($library.subset({ schedule_id: $schedule_id }).first)}
	let manoeuvre_ind: number | undefined = undefined;
  let version: string = data.fa_versions[0];
  
	const submit = async () => {
		const q = {
			...{
				n_results: $n_results,
				me_only_flag: $me_only_flag,
				difficulty: $difficulty,
				truncate: $truncate,
				schedule_id: $schedule_id,
				one_per_pilot_flag: $one_per_pilot_flag,
				version
			},
			...(manoeuvre_ind ? { manoeuvre_ind } : {}),
      ...($sort_by_score_flag ? {sort_by_score_flag: $sort_by_score_flag} : {}),
      ...($select_by_date ? {date_after: $date_after, date_before: $date_before} : {n_days})
		};
		console.log(q);
    const _method = $sort_by_score_flag ? 'leaderboard' : 'flightlist';
    dbServer.get('analysis/' + _method, q).then((res) => {
      table_rows = res.results.map(row=>{return {...row, score: Math.round(row.score*100)/100}});
    });
    lastResponse = _method;
		
	};
</script>

<div class="col-3 bg-light pt-5">
  <div class="mt-2 mb-3">
    <input
			type="checkbox"
			class="form-check-input"
			id="sort_by_score_flag"
			name="sort_by_score_flag"
			bind:checked={$sort_by_score_flag}
		/>
		<label for="sort_by_score_flag">Sort By Score</label>
  </div>
  {#if $sort_by_score_flag || $user?.is_superuser}
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
  {/if}
	<div class="mb-3">
		<label for="version">Schedule</label>
		<button class="form-select" data-bs-toggle="dropdown">{schedule_name}</button>
		<ScheduleSelect
			level="schedule"
			onselected={(schedule, manoeuvre) => {
				console.log(`selecting: ${schedule.schedule_name}`);
				$schedule_id = schedule.schedule_id;
			}}
		/>
	</div>
	<div class="mb-3">
		<label for="version">FA Version</label>
		<select class="form-select" id="version" name="version" required bind:value={version}>
			{#each data.fa_versions as ver}
				<option value={ver}>{ver}</option>
			{/each}
		</select>
	</div>
	<div class="mb-3">
		<label for="difficulty">Difficulty</label>
		<select class="form-select" id="difficulty" name="difficulty" required bind:value={$difficulty}>
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
  {#if $sort_by_score_flag}
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
  {/if}
  <div class="mt-2 mb-3">
    <input
      type="checkbox"
      class="form-check-input"
      id="select_by_date"
      name="select_by_date"
      bind:checked={$select_by_date}
    />
    <label for="select_by_date">Select By Dates</label>
  </div>  
  {#if $select_by_date}
    <div class="mb-3">
      <label for="startDate">Start</label>
      <input id="startDate" class="form-control" type="date" bind:value={$date_after}/>
      <label for="endDate">End</label>
      <input id="endDate" class="form-control" type="date" bind:value={$date_before}/>
    </div>
  {:else}
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
  {/if}
	<button class="btn btn-primary" on:click={submit}>Submit</button>
</div>


<div class="col">
  {#if lastResponse}
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
              {#each col_heads as col_head}
                <td>{row[col_map[col_head]]}</td>
              {/each}
              <td>View</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
