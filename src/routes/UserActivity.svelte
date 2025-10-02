<script lang="ts">
	import { library } from '$lib/schedule/library';
	import { userActivity, requestActivity } from '$lib/stores/userActivity';
	import { nth } from '$lib/utils/numbers';

	let scheduleSummary = $derived($library.summarize());
</script>

{#snippet rankinfo(
	rank: number,
	ssummary: { repr: string; count: number },
	normalised: boolean = false
)}
	<td class="text-nowrap"
		>{nth(normalised ? Math.round(ssummary.count * rank) : rank)} of {ssummary.count}</td
	>
	<td class="text-nowrap">{ssummary.repr}</td>
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
					{#await requestActivity() then _}
						{#each $userActivity || [] as row, i}
							{#if scheduleSummary[row.best_rank_schedule_id]}
								<tr class="align-middle">
									<td>{i + 1}</td>
									<td>{row.name}</td>
									<td>{row.total_n}</td>
									<td>{row.country}</td>
									{@render rankinfo(
										row.best_rank,
										scheduleSummary[row.best_rank_schedule_id],
										false
									)}
								</tr>
							{/if}
						{/each}
					{/await}
				</tbody>
			</table>
		</div>
	</div>
</div>
