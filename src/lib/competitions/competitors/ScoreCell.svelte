<script lang="ts">
	import { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import { activeFlight } from '$lib/stores/shared';
	import { bin, isCompFlight, bootTime, isComplete } from '$lib/stores/analysis';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import Popup from '$lib/components/Popup.svelte';
	import LinkDbFlight from '$lib/competitions/competitors/LinkDBFlight.svelte';

	let { round, competitorID }: { round: ContestManager; competitorID: string } = $props();

	const competitor: PilotManager = $derived(
		(round.competitors || []).find((competitor) => competitor.competitor.id == competitorID)!
	);
  let showDBLinkMenu = $state(false);

  let showRaw = $derived((round.summary.result_rules?.normalise_best_to_n || round.summary.result_rules?.normalise_average_to_n) ? true : false);
</script>

<td class="text-center p-0 ">
<div class="dropdown">
	<button
		type="button"
		class="btn btn-outline-primary  w-100"
		data-bs-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		title="Score options"
	>
		{#if competitor?.competitor.raw_score}
      <span>{competitor.competitor.raw_score.toFixed(2)}, {competitor.competitor.normalised_score?.toFixed(2)}</span>
		{:else}
			...
		{/if}
	</button>
	<div class="dropdown-menu">
		{#if !competitor?.competitor.raw_score}
			{#if round.summary.is_open_now && (round.isMyComp || round.summary.add_rules?.cd_and_self_add)}
				<button class="dropdown-item" onclick={()=>{showDBLinkMenu=true}}>Link Flight from DB</button>
				{#if $bin && !$activeFlight && $isComplete && $isCompFlight}
					<button class="dropdown-item"> Upload & Link Active Flight </button>
				{/if}
        <button class="dropdown-item">Throw Round</button>
			{/if}
    {:else}
      {#if round.isMyComp}
        <button class="dropdown-item">Unlink</button>
      {/if}
      <button class="dropdown-item">View Flight</button>
      <button class="dropdown-item">View Analysis</button>
		{/if}
    
    
	</div>
  
</div>
</td>
<Popup show={showDBLinkMenu}>
  <LinkDbFlight {round} {competitor}/>
</Popup>