<script lang="ts">
	import { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import { activeFlight, loading, unblockProgress } from '$lib/stores/shared';
	import { bin, isCompFlight, bootTime, isComplete } from '$lib/stores/analysis';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import Popup from '$lib/components/Popup.svelte';
	import LinkDbFlight from '$lib/competitions/competitors/LinkDBFlight.svelte';
	import { loadAnalysisFromDB } from '$lib/flight/analysis';
	import { loadInPlotter } from '$lib/database/flight';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	import { user } from '$lib/stores/user';
	import { Flight } from '$lib/database/flight';
	import { setComp } from '$lib/stores/contests';
	import { prettyPrintHttpError } from '$lib/utils/text';

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
