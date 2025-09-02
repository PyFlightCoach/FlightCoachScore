<script lang="ts">
	import { dbServer } from '$lib/api';
	import type { DBFlightRanked, DBFlightScore } from '$lib/flight/db';
	import { setComp } from '$lib/stores/contests';
	import { faVersion } from '$lib/stores/shared';
	import type { ContestManager } from './ContestManager';
	import type { PilotManager } from './PilotManager';

	let { round, competitor, show=$bindable(false) }: { round: ContestManager; competitor: PilotManager, show: boolean } = $props();

	let flights: DBFlightRanked[] = $state([]);

	dbServer
		.get('analysis/flightlist', { params: { n_results: 100, fa_version: $faVersion } })
		.then((res) => {
			flights = res.data.results.filter(
				(f: DBFlightRanked) => f.pilot_id == competitor.competitor.id
			) as DBFlightRanked[];
		});
</script>

<span>Select flight from the database</span>
<table class="table table-bordered table-striped">
	<thead class="table-dark">
		<tr>
			<th>Pilot</th>
			<th>Time</th>
			<th>Score</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each flights as flight}
			<tr>
				<td>{flight.name} {flight.country}</td>
				<td>{new Date(flight.date).toLocaleString()}</td>
				<td>{flight.score}</td>
				<td class="p-1"
					><button
						class="btn btn-outline-secondary b-0"
						title="Link this flight"
						onclick={() => {
              round.addFlight(flight.flight_id)
              .then((res) => {
                setComp(res); 
                show = false;
              })
              .catch((err) => {
                alert(`Failed to link flight: ${err}`);
              });
            }}
					>
						Link
					</button></td
				>
			</tr>
		{/each}
	</tbody>
</table>
