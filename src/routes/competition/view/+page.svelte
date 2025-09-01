<script lang="ts">
	import { activeComp, setComp } from '$lib/stores/contests';
	import { sum } from '$lib/utils/arrays';
	import Popup from '$lib/components/Popup.svelte';
	import CompThingCell from '$lib/competitions/CompThingCell.svelte';
	import CompetitorCell from '$lib/competitions/CompetitorCell.svelte';
  import AddCompetitor from '$lib/competitions/AddCompetitor.svelte';
  
	let nrounds = $derived($activeComp.children.map((stage) => stage.children.length));

	let showAddPilot = $state(false);
</script>

<div class="table-responsive">
	<table class="table table-bordered">
		<thead>
			<tr>
				<th>Competition:</th>
				<th colspan={sum(nrounds) + 3}><CompThingCell thing={$activeComp} /></th>
			</tr>
			<tr>
				<th>Stages:</th>
				{#each $activeComp.children as stage, i}
					<th colspan={nrounds[i] + ($activeComp.isMyComp ? 1 : 0)}
						><CompThingCell thing={stage} /></th
					>
				{/each}
				{#if $activeComp.isMyComp}
					<th
						role="button"
						class="w-auto text-center"
						onclick={() => {
							$activeComp.addChild(`Stage ${$activeComp.children.length + 1}`)
              .then(setComp)
              .catch((e) => alert(`Failed to create stage: ${e}`));
						}}
						title="Create new stage">+</th
					>
				{/if}
			</tr>
			<tr>
				<th>Rounds:</th>
				{#each $activeComp.children as stage, i}
					{#each stage.children as round}
						<th class={`${round.summary.is_open_now ? 'bg-primary' : ''}`}
							><CompThingCell thing={round} /></th
						>
					{/each}
					{#if $activeComp.isMyComp}
						<th
							role="button"
							class="w-auto text-center"
							onclick={() => {
                stage.addChild(`Round ${stage.children.length + 1}`)
                  .then(setComp)
                  .catch((e) => alert(`Failed to create round: ${e}`));
							}}
							title="Create new {stage.summary.name} round">+</th
						>
					{/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $activeComp.competitors as competitor, i}
				<tr>
					<td><CompetitorCell {competitor} /></td>
					{#each $activeComp.children as stage}
						{#each stage.children as round}
							{#if round.summary.competitors && round.summary.competitors.length > i && round.summary.competitors[i].flight_id}
								<td class="">
									{round.summary.competitors[i].raw_score}, {round.summary.competitors[i].normalised_score}
								</td>
							{:else}
								<td class=""></td>
							{/if}
						{/each}
						<td></td>
					{/each}
				</tr>
			{/each}
			{#if $activeComp.isMyComp}
				<tr
					><td
						role="button"
						title="Add Pilot"
						onclick={() => {
							showAddPilot = !showAddPilot;
						}}
					>
						+
					</td></tr
				>
				<Popup bind:show={showAddPilot}>
					<AddCompetitor
						competition={$activeComp}
						onadded={() => {
							showAddPilot = false;
						}}
					/>
				</Popup>
			{/if}
		</tbody>
	</table>
</div>
