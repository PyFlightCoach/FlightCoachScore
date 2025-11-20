<script lang="ts">
	import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
	import { numberToPosition } from '$lib/utils/text';
  import TopFlightCell from '$lib/database/TopFlightCell.svelte';
  import type {TopFlightsResponse} from '$lib/database/userActivity';
	let {
		topflights=$bindable()
	}: {
		topflights: TopFlightsResponse[] | undefined;
	} = $props();


  
</script>

<div class="table-responsive rounded text-center">
	<table class="table table-striped">
		<thead class="table-dark">
			<tr>
				<th class="text-start">Schedule</th>
        {#if topflights && topflights[0]}
          {#each topflights[0]?.flights as _, i}
            <th>{numberToPosition(i + 1)}</th>
          {/each}
        {/if}
				<th>Flight Count</th>
				<!--<th colspan="2">Best Normalised</th>-->
			</tr>
		</thead>
		<tbody>
			{#each topflights || [] as row, i}
				{#if row.count > 0}
					<tr class="align-middle">
						<th class="text-start">{row.schedule.toUpperCase()}</th>
						<TopFlightCell flight={row.flights[0] || undefined} />
						<TopFlightCell flight={row.flights[1] || undefined} />
						<TopFlightCell flight={row.flights[2] || undefined} />
						<td>{row.count}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
