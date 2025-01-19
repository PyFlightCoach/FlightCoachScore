<script lang="ts">
	import { library } from '$lib/schedules/library';
  import {scheduleRepr, type DBSchedule} from '$lib/database/interfaces';
	import {userActivity} from '$lib/stores/userActivity';
  import {nth} from '$lib/utils/numbers';

	let schedule_id: string | undefined = $state(undefined);
	let category_id: string | undefined = $state(undefined);
	let n_days: number | undefined = $state(undefined);
	let date_after: number | undefined = $state(undefined);
	let date_before: number | undefined = $state(undefined);
	let includeAll: boolean | undefined = $state(undefined);

	const query_parameters = $derived.by(() => {
		let parms: string[] = [];
		if (schedule_id) parms.push(`schedule_id=${schedule_id}`);
		if (category_id) parms.push(`category_id=${category_id}`);
		if (n_days) parms.push(`n_days=${n_days}`);
		if (date_after) parms.push(`date_after=${date_after}`);
		if (date_before) parms.push(`date_before=${date_before}`);
		if (includeAll != undefined) parms.push(`includeAll=${includeAll}`);
		if (parms.length == 0) return '';
		return '?' + parms.join('&');
	});

</script>

{#snippet rankinfo(rank: number, schedule: DBSchedule, normalised: boolean = false)}
  <td class="text-nowrap">{nth(normalised ? Math.round(schedule.num_flights * rank) : rank)} of {schedule.num_flights}</td>
  <td class="text-nowrap">{scheduleRepr(schedule)}</td>
{/snippet}

<div class="row justify-content-center pt-0">
	<div class="col-auto text-center">
		<h1 class="h-1 pt-md-3">Top Users</h1>
		<div class="row table-responsive">
			<table class="table">
				<thead>
					<tr>
						<th>#</th>
						<th>Pilot</th>
						<th>Flights</th>
						<th>Country</th>
            <th colspan="2">Best Rank</th>
            <!--<th colspan="2">Best Normalised</th>-->
					</tr>
				</thead>
				<tbody>
					{#each $userActivity as row, i}
						<tr class="align-middle">
							<td>{i + 1}</td>
							<td>{row.name}</td>
							<td>{row.total_n}</td>
							<td>{row.country}</td>
              {@render rankinfo(row.best_rank, $library.subset({schedule_id: row.best_rank_schedule_id}).first, false)}
              <!--
              {@render rankinfo(row.best_norm_rank, $library.subset({schedule_id: row.best_norm_rank_schedule_id}).first, true)}
            -->
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
