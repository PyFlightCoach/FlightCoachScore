<script lang="ts">
	import { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import { activeFlight } from '$lib/stores/shared';
	import { bin, isCompFlight, bootTime, isComplete } from '$lib/stores/analysis';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import Popup from '$lib/components/Popup.svelte';
	import LinkDbFlight from '$lib/competitions/competitors/LinkDBFlight.svelte';
	import { loadAnalysisFromDB } from '$lib/flight/analysis';
	import { loadInPlotter } from '$lib/database/flight';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	let { round, competitorID }: { round: ContestManager; competitorID: string } = $props();

	const competitor: PilotManager = $derived(
		(round.competitors || []).find((competitor) => competitor.competitor.id == competitorID)!
	);
	let showDBLinkMenu = $state(false);
	let showProperties = $state(false);
	let showRaw = $derived(
		round.summary.result_rules?.normalise_best_to_n ||
			round.summary.result_rules?.normalise_average_to_n
			? true
			: false
	);

</script>

<td class="text-center p-0">
	<div class="dropdown">
		<button
			type="button"
			class="btn btn-outline-primary w-100 "
			data-bs-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false"
			title="Score options"
		>
			{#if competitor?.competitor.raw_score}
				<span class="{competitor?.competitor.score_dropped ? 'text-decoration-line-through' : ''}"
					>{competitor.competitor.raw_score.toFixed(2)}, {competitor.competitor.normalised_score?.toFixed(
						2
					)}</span
				>
			{:else}
				...
			{/if}
		</button>
		<div class="dropdown-menu">
			<button
				class="dropdown-item"
				onclick={() => {
					showProperties = true;
				}}>Properties</button
			>
			{#if !competitor?.competitor.raw_score}
				{#if round.summary.is_open_now && (round.isMyComp || round.summary.add_rules?.cd_and_self_add)}
					<button
						class="dropdown-item"
						onclick={() => {
							showDBLinkMenu = true;
						}}>Link Flight from DB</button
					>
					{#if $bin && !$activeFlight && $isComplete && $isCompFlight}
						<button class="dropdown-item"
              onclick={() => {
                
              }}
            >
              Upload & Link Active Flight
            </button>
					{/if}
					<button class="dropdown-item">Throw Round</button>
				{/if}
			{:else}
				{#if round.isMyComp}
					<button class="dropdown-item">Unlink</button>
				{/if}
				{#if competitor.competitor.flight_id}
					<button
						class="dropdown-item"
						onclick={() => {
							loadInPlotter(competitor.competitor.flight_id!);
						}}
						disabled={!competitor.competitor.flight_id}>View Flight</button
					>
					<button
						class="dropdown-item"
						onclick={() => loadAnalysisFromDB(competitor.competitor.flight_id!)}
						disabled={!competitor.competitor.flight_id}>View Analysis</button
					>
				{/if}
			{/if}
		</div>
	</div>
	<Popup show={showDBLinkMenu}>
		<LinkDbFlight {round} {competitor} />
	</Popup>
	<Popup bind:show={showProperties}>
		<DisplayDict dict={competitor?.competitor} />
	</Popup>
</td>
