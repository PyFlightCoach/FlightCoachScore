<script lang="ts">
	import FlightInfo from './FlightInfo.svelte';
	import { DBFlight } from '$lib/database/flight';
	import { activeFlight } from '$lib/stores/shared';
	import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
	import { prettyPrintHttpError } from '$lib/utils/text';

	let {
		lastResponse = $bindable(),
		table_rows = $bindable()
	}: { lastResponse: 'leaderboard' | 'flightlist' | undefined; table_rows: DBFlightRanked[] } =
		$props();

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

	let col_heads: string[] = $derived(
		lastResponse
			? {
					leaderboard: ['Position', 'Pilot', 'Country', 'Date', 'Score'],
					flightlist: ['Date', 'Pilot', 'Country', 'Score', 'Comment']
				}[lastResponse]
			: []
	);

	
  let showFlight: DBFlightRanked | undefined = $state();

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
					{#if row.ooo && i > 0 && table_rows[i - 1].rank < row.rank - 1}
						<tr><td colspan={col_heads.length + 1} class="p-0 bg-secondary">...</td></tr>
					{/if}
					<tr
						class={row.flight_id == $activeFlight?.source.db?.meta.flight_id ? 'table-active' : ''}
						role="button"
						style="font-family: 'Twemoji Country Flags', sans-serif !important"
						onclick={() => {
							if (showFlight?.flight_id == row.flight_id) {
								showFlight = undefined;
							} else {
								showFlight = row;
							}
						}}
					>
						{#each col_heads as col_head}
							<td>{row[col_map[col_head]]}</td>
						{/each}
						<td>
							{#if showFlight?.flight_id == row.flight_id}
								<i class="bi bi-chevron-up"></i>
							{:else}
								<i class="bi bi-chevron-down"></i>
							{/if}
						</td>
					</tr>
					{#if showFlight?.flight_id == row.flight_id}
						<tr class="p-0">
							<td colspan={col_heads.length + 1} class="p-1">
                {#await DBFlight.load(row.flight_id) then res}
                  <FlightInfo f={res} rank={row.rank} />
                {:catch error}
                  Error loading flight: {prettyPrintHttpError(error)}
                {/await}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}
