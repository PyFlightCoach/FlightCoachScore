<script lang="ts">
  import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
  import {numberToPosition} from '$lib/utils/text';

	let {
		topflights
	}: {
		topflights: { schedule: string; count: number; flights: DBFlightRanked[] }[];
	} = $props();


</script>

<div class="table-responsive rounded">
	<table class="table table-striped">
		<thead class="table-dark">
			<tr>
				<th>Schedule</th>
        <th>Flight Count</th>
        {#each topflights[0]?.flights as _, i}
          <th>{numberToPosition(i + 1)}</th>
        {/each}
				<!--<th colspan="2">Best Normalised</th>-->
			</tr>
		</thead>
		<tbody>
			{#each topflights as row, i}
				
					<tr class="align-middle">
						<td>{row.schedule}</td>
						<td>{row.count}</td>
						<td>{row.flights[0]}</td>
						<td>{row.flights[1]}</td>
						<td>{row.flights[2]}</td>
					</tr>
				
			{/each}
		</tbody>
	</table>
</div>
