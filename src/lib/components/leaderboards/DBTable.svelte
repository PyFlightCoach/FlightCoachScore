<script lang="ts">
	import { loadKnowns } from '$lib/schedules.js';
	import { user } from '$lib/stores/user.js';
	import FlightInfo from './FlightInfo.svelte';
	import { Flight } from '$lib/database/flight';
	loadKnowns();

	export let lastResponse: 'leaderboard' | 'flightlist' | undefined = undefined;
	export let table_rows: Record<string, any>[];

	let col_map = {
		id: 'flight_id',
		lat: 'origin_lat',
		lng: 'origin_lng',
		Name: 'name',
		Country: 'country',
		Date: 'date',
		Comment: 'comment',
		Rank: 'rank',
		Position: 'table_rank',
		Score: 'score',
		Version: 'version'
	};

	let col_heads: string[];
	$: if (lastResponse == 'leaderboard') {
		col_heads = ['Position', 'Rank', 'Name', 'Country', 'Date', 'Score'];
	} else if (lastResponse == 'flightlist') {
		col_heads = [...['Date', 'Score', 'Comment'], ...($user?.is_superuser ? ['Name'] : [])];
	}

	let showID: Number | undefined;
	let showFlight: Flight | undefined;
	//  <a href="{base}/database/flight/?flight_id={row.flight_id}">View</a>
</script>

<div class="col">
	{#if lastResponse}
		<div class="mh-100 overflow-scroll">
			<table class="table table-sm table-striped text-center">
				<thead class="table-dark sticky-top" style="z-index:-1">
					<tr>
						{#each col_heads as col_head}
							<th scope="col">{col_head}</th>
						{/each}
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					{#each table_rows as row, i}
						<tr role="button" on:click={() => {
              if (showID == i) {
                showID = undefined;
                showFlight = undefined;
              } else {
                showID = i;
                Flight.load(row.flight_id).then(res => {
                  showFlight = res;
                });
              }
            }}
            >
							{#each col_heads as col_head}
								<td>{row[col_map[col_head]]}</td>
							{/each}
							<td>
                {#if showID == i}
                  <i class="bi bi-chevron-up"></i>
                {:else}
                  <i class="bi bi-chevron-down"></i>
                {/if}
							</td>
						</tr>
						{#if showID == i}
							<tr>
								<td colspan={col_heads.length + 1}>
									{#if showFlight}
										<FlightInfo bind:f={showFlight} />
									{:else}
										Loading
									{/if}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
