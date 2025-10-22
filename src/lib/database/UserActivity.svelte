<script lang="ts">
	import { library } from '$lib/schedule/library';
	import { type UserActivityResponse } from '$lib/database/userActivity';
	import { nth } from '$lib/utils/numbers';
	let { activity }: { activity: UserActivityResponse[] } = $props();

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

<div class="table-responsive rounded">
	<table class="table table-striped">
		<thead class="table-dark">
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
			{#each activity as row, i}
				{#if scheduleSummary[row.best_rank_schedule_id]}
					<tr class="align-middle">
						<td>{i + 1}</td>
						<td>{row.name}</td>
						<td>{row.total_n}</td>
						<td>{row.country}</td>
						{@render rankinfo(row.best_rank, scheduleSummary[row.best_rank_schedule_id], false)}
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
