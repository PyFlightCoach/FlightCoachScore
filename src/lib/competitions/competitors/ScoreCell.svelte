<script lang="ts">
	import { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import Popup from '$lib/components/Popup.svelte';
	import LinkDbFlight from '$lib/competitions/competitors/LinkDBFlight.svelte';
	import { loadAnalysisFromDB } from '$lib/flight/analysis';
	import { loadInPlotter } from '$lib/database/flight';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	import { user } from '$lib/stores/user';
	import { DBFlight } from '$lib/database/flight';
	import { setComp } from '$lib/stores/contests';
	import { prettyPrintHttpError } from '$lib/utils/text';
	
	let {
		round,
		competitorID,
		display = $bindable('Results'),
	}: {
		round: ContestManager;
		competitorID: string;
		display?: 'Results' | 'Running Order';
	} = $props();

	const competitor: PilotManager = $derived(
		(round.competitors || []).find((competitor) => competitor.competitor.id == competitorID)!
	);
	let showDBLinkMenu = $state(false);
	let showProperties = $state(false);

	const flightInfo: Promise<DBFlight | undefined> = $derived(
		competitor?.competitor.flight_id
			? DBFlight.load(competitor.competitor.flight_id)
			: Promise.resolve(undefined)
	);

	let active = $state(false);

	let allowDropDown = $derived(
		round.isMyComp ||
			competitor?.competitor.flight_id ||
			(round.summary.what_am_i == 'Round' && 
        round.summary.is_open_now &&
				round.competition.summary.add_rules?.cd_and_self_flight_add &&
				competitor.isMe($user!.id) )
	);
    $inspect(competitor.isMe($user!.id), 'is Me');
</script>

{#snippet displayValue()}
  {#if display === 'Results'}
    {#if competitor?.competitor.raw_score}
		<div class="{competitor?.competitor.score_dropped ? 'text-decoration-line-through ' : ''} row">
			{#if round.normalise}
				<div class="col text-muted text-sm fst-italic fw-light">
					{competitor.competitor.raw_score.toFixed(2)}
				</div>
			{/if}
			<div class="col fw-bold">{competitor.competitor.normalised_score?.toFixed(2)}</div>
		</div>
    {:else if !competitor?.competitor.missed_cut && round.summary.what_am_i === 'Round'}
      {#if competitor?.isMe($user!.id) || round.competition.isMyComp}
      ...
      {:else}
      - 
      {/if}
    {/if}
  {:else if display === 'Running Order' && !competitor?.competitor.missed_cut}
    <div class={competitor.competitor.raw_score ? 'text-decoration-line-through text-secondary' : 'fw-bold '}>
      {competitor.competitor.flight_order}
    </div>
 
  {/if}
{/snippet}

{#if display == 'Results' || round.summary.what_am_i == 'Round'}
	<td
		class="text-center text-nowrap p-0 px-2 b-0 "
		class:active
		onmouseenter={() => {
			if (!competitor?.competitor.missed_cut && allowDropDown) {
				active = true;
			}
		}}
		onmouseleave={() => {
			active = false;
		}}
	>
		{#if !allowDropDown}
			{@render displayValue()}
		{:else}
			<button
				class="btn btn-link text-decoration-none m-0 p-0 text-dark"
				type="button"
				data-bs-toggle="dropdown"
				aria-haspopup="true"
				aria-expanded="false"
				title="Score options"
			>
				{@render displayValue()}
			</button>
			<div class="dropdown-menu">
				{#if !competitor?.competitor.raw_score}
					{#if round.summary.is_open_now && (round.isMyComp || (round.competition.summary.add_rules?.cd_and_self_add && competitor.isMe))}
						<button
							class="dropdown-item"
							onclick={() => {
								showDBLinkMenu = true;
							}}>Link Flight from DB</button
						>
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
		{/if}
		<Popup bind:show={showDBLinkMenu}>
			<LinkDbFlight {round} {competitor} bind:show={showDBLinkMenu} />
		</Popup>
		<Popup bind:show={showProperties}>
			<DisplayDict dict={competitor?.competitor} />
		</Popup>
	</td>
{/if}

<style>
	.active {
		background: grey;
	}

	.s {
		text-decoration: line-through;
		text-decoration-thickness: 2px;
		text-decoration-style: double;
	}
</style>
