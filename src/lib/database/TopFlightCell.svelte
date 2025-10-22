<script lang="ts">
	import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
	import { loadInPlotter } from '$lib/database/flight';

	let { flight }: { flight: DBFlightRanked | undefined } = $props();

	let active = $state(false);
</script>

<td
	class:active
	onmouseenter={() => {
		active = !!flight && true;
	}}
	onmouseleave={() => {
		active = false;
	}}
	role={flight ? 'button' : ''}
	onclick={() => {
		if (flight) {
			loadInPlotter(flight?.flight_id);
		}
	}}
>
	{flight?.name}
</td>

<style>
	.active {
		background: grey;
	}
</style>
