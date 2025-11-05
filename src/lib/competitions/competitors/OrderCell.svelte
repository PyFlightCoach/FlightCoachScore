<script lang="ts">
	import { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';

	let { round, competitorID }: { round: ContestManager; competitorID: string } = $props();

	const competitor: PilotManager = $derived(
		(round.competitors || []).find((competitor) => competitor.competitor.id == competitorID)!
	);

	let active = $state(false);
</script>

<td
	class="text-center text-nowrap p-0 px-2 b-0"
	class:active
	onmouseenter={() => {
    if (!competitor?.competitor.missed_cut) {
      active = true;
    }
		
	}}
	onmouseleave={() => {
		active = false;
	}}
>
	{competitor.competitor.flight_order}
</td>

<style>
	.active {
		background: grey;
	}
</style>
