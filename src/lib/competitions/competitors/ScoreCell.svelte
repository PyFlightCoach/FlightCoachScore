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

	let {
		round,
		competitorID,
		display = $bindable('Results')
	}: { round: ContestManager; competitorID: string; display?: 'Results' | 'Running Order' } = $props();

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

	const flightInfo: Promise<Flight | undefined> = $derived(
		competitor?.competitor.flight_id
			? Flight.load(competitor.competitor.flight_id)
			: Promise.resolve(undefined)
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
	<button
		class="btn btn-link text-decoration-none m-0 p-0 text-dark"
		type="button"
		data-bs-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		title="Score options"
		disabled={(!round.summary.is_open_now && !competitor?.competitor.raw_score) ||
			competitor?.competitor.missed_cut}
	>
		{#if competitor?.competitor.raw_score && display === 'Results'}
			<div
				class={competitor?.competitor.score_dropped
					? 'text-decoration-line-through '
					: ''}
			>
				{#if showRaw}{competitor.competitor.raw_score.toFixed(2)},
				{/if}
				{competitor.competitor.normalised_score?.toFixed(2)}
			</div>
		{:else if !competitor?.competitor.missed_cut}
			{#if display === 'Running Order'}
      <div class="{competitor.competitor.raw_score ? 'text-decoration-line-through' : ''}">
				{competitor.competitor.flight_order}</div>
			{:else}
				...
			{/if}
		{/if}
	</button>
	<div class="dropdown-menu">
		{#if !competitor?.competitor.raw_score}
			{#if round.summary.is_open_now && (round.isMyComp || round.summary.add_rules?.cd_and_self_add)}
				<button
					class="dropdown-item"
					onclick={() => {
						showDBLinkMenu = true;
					}}>Link Flight from DB</button
				>
				{#if $bin && !$activeFlight && $isComplete && $isCompFlight}
					<button class="dropdown-item" onclick={() => {}}> Upload & Link Active Flight </button>
				{/if}
				<button class="dropdown-item">Throw Round</button>
			{/if}
		{:else}
			{#if competitor.competitor.flight_id}
				{#await flightInfo}
					<span class="dropdown-item-text">Loading flight...</span>
				{:then flight}
					{#if flight && (flight.meta.privacy !== 'basic' || $user?.is_superuser || flight.isMine)}
						<button
							class="dropdown-item"
							onclick={() => {
								loadInPlotter(competitor.competitor.flight_id!);
							}}
							disabled={!competitor.competitor.flight_id}>View Flight</button
						>
						{#if flight.meta.privacy !== 'view_flown' || $user?.is_superuser || flight.isMine}
							<button
								class="dropdown-item"
								onclick={() => {
									loadAnalysisFromDB(competitor.competitor.flight_id!);
								}}
								disabled={!competitor.competitor.flight_id}>View Analysis</button
							>
						{/if}
					{/if}
				{/await}
			{/if}
			{#if round.isMyComp || $user?.is_superuser}
				<button
					class="dropdown-item"
					onclick={() => {
						competitor
							.deleteScore()
							.then(setComp)
							.catch((err) => {
								alert('Failed to Delete: ' + prettyPrintHttpError(err));
							});
					}}>Unlink</button
				>
			{/if}
		{/if}
		{#if round?.isMyComp || $user?.is_superuser}
			<button
				class="dropdown-item"
				onclick={() => {
					showProperties = true;
				}}
			>
				Attributes
			</button>
		{/if}
	</div>
	<Popup bind:show={showDBLinkMenu}>
		<LinkDbFlight {round} {competitor} />
	</Popup>
	<Popup bind:show={showProperties}>
		<DisplayDict dict={competitor?.competitor} />
	</Popup>
</td>

<style>
	.active {
		background: grey;
	}
</style>
