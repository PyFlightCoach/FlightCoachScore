<script lang="ts">
	import { dbServer } from '$lib/api';
	import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
	import { setComp } from '$lib/stores/contests';
	import { faVersion } from '$lib/stores/shared';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import type { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import { compareUUIDs, prettyPrintHttpError } from '$lib/utils/text';

	let {
		round,
		competitor,
		show = $bindable(false)
	}: { round: ContestManager; competitor: PilotManager; show?: boolean } = $props();

	const usedFlights = round.competition.allFlightIds;

	let flights: DBFlightRanked[] | undefined = $state();
	let params = {
		n_results: 100,
		fa_version: $faVersion,
		schedule_id: round.summary.schedule_id || undefined,
		date_after: round.parent!.summary.flight_rules?.flown_whilst_open
			? round.summary.date_start || undefined
			: undefined
	};

	$inspect(round.summary.schedule_id, 'schedule id');
	dbServer.get('analysis/flightlist', { params }).then((res) => {
		flights = res.data.results.filter((f: DBFlightRanked) => {
			return (
				!usedFlights.includes(f.flight_id) &&
				compareUUIDs(f.pilot_id, competitor.competitor.id) &&
				round.checkCanUpload(
					new Date(f.datetime!),
					new Date(f.datetime!),
					competitor.competitor.id,
					round.summary.schedule_id || undefined
				)
			);
		}) as DBFlightRanked[];
	});
</script>

{#if flights === undefined}
	<div>Loading flights...</div>
{:else if flights.length == 0}
	<div>No eligible flights found in database</div>
{:else}
	<span>Select flight from the database</span>
	<table class="table table-bordered table-striped">
		<thead class="table-dark">
			<tr>
				<th>Pilot</th>
				<th>Time</th>
				<th>Score</th>
				<th>Comment</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each flights as flight}
				<tr>
					<td>{flight.name} {flight.country}</td>
					<td>{new Date(flight.date).toLocaleString()}</td>
					<td>{flight.score?.toFixed(2) || '-'}</td>
					<td>{flight.comment}</td>
					<td class="p-1"
						><button
							class="btn btn-outline-secondary b-0"
							title="Link this flight"
							onclick={() => {
								round
									.addFlight(flight.flight_id)
									.then((res) => {
										setComp(res);
										show = false;
									})
									.catch((err) => {
										alert(`Failed to link flight: ${prettyPrintHttpError(err)}`);
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
{/if}
