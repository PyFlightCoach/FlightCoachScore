<script lang="ts">
  import { checkUser } from '$lib/stores/user.js';
	import FlightInfo from './FlightInfo.svelte';
	import { Flight } from '$lib/database/flight';
	import { activeFlight } from '$lib/stores/shared';
	import type { DBFlightRanked } from '$lib/flight/db';
  
	export let lastResponse: 'leaderboard' | 'flightlist' | undefined = undefined;
	export let table_rows: DBFlightRanked[];

	let col_map: Record<string, keyof DBFlightRanked> = {
		id: 'flight_id',
		lat: 'origin_lat',
		lng: 'origin_lng',
		Pilot: 'name',
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
		col_heads = ['Position', 'Pilot', 'Country', 'Date', 'Score'];
	} else if (lastResponse == 'flightlist') {
		col_heads = ['Date', 'Pilot', 'Country', 'Score', 'Comment'];
	}

	$: loadedID = $activeFlight?.meta.flight_id;

	$: showID = loadedID;
	let showFlight: Flight | undefined;
	$: if (showID)
		checkUser()
			.then(() => {
				Flight.load(showID!).then((r) => {
					showFlight = r;
				});
			})
			.catch(() => {
				console.log('failed to load flight');
			});

</script>

{#if lastResponse}
	<div class="table-responsive">
		<table class="table table-striped text-center">
			<thead class="table-dark" style="z-index:-1">
				<tr>
					{#each col_heads as col_head}
						<th scope="col">{col_head}</th>
					{/each}
					<th scope="col"></th>
				</tr>
			</thead>
			<tbody>
				{#each table_rows as row, i}
          {#if row.ooo }
          <tr><td colspan="{col_heads.length+1}" class="p-0 bg-secondary">...</td></tr>
          {/if}
					<tr
						class={row.flight_id == $activeFlight?.meta.flight_id ? 'table-active' : ''}
						role="button"
						style="font-family: 'Twemoji Country Flags', sans-serif !important" 
						on:click={() => {
							if (showID == row.flight_id) {
								showID = undefined;
								showFlight = undefined;
							} else {
								showID = row.flight_id;
							}
						}}
					>
						{#each col_heads as col_head}
							<td>{row[col_map[col_head]]}</td>
						{/each}
						<td>
							{#if showID == row.flight_id}
								<i class="bi bi-chevron-up"></i>
							{:else}
								<i class="bi bi-chevron-down"></i>
							{/if}
						</td>
					</tr>
					{#if showID == row.flight_id}
						<tr class="p-0">
							<td colspan={col_heads.length + 1} class="p-1">
								{#if showFlight}
									<FlightInfo bind:f={showFlight} rank={row.rank}/>
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
