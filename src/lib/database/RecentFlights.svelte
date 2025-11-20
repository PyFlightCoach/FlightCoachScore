<script lang="ts">
	import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
	import { library } from '$lib/schedule/library';

	let { flightlist=$bindable() }: { flightlist: DBFlightRanked[] | undefined } = $props();

	let scheduleSummary = $derived($library.summarize());

	function getFlag(country: string) {
		const data = country.split(' ');
		return data[data.length - 1];
	}
</script>

<div class="table-responsive rounded">
	<table class="table table-striped text-center">
		<thead class="table-dark" style="z-index:-1">
			<tr>
				<th scope="col" class="text-start">Pilot</th>
				<th scope="col">Schedule</th>
				<th scope="col">Time</th>
				<th scope="col" class="text-start">Comment</th>
			</tr>
		</thead>
		<tbody>
			{#each flightlist || [] as row, i}
				<tr style="font-family: 'Twemoji Country Flags', sans-serif !important">
					<td class="text-start">{row.name} {getFlag(row.country)}</td>
					<td>{scheduleSummary[row.schedule_id].repr.toUpperCase()}</td>
					<td
						>{new Date(row.datetime!).toLocaleString([], {
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}</td
					>
					<td class="px-0 overflow-hidden text-nowrap text-start" style="max-width: 150px">

              {row.comment}
            
          </td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
