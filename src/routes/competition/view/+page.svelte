<script lang="ts">
	import { activeComp, setComp } from '$lib/stores/contests';
	import { sum } from '$lib/utils/arrays';
	import Popup from '$lib/components/Popup.svelte';
	import CompThingCell from '$lib/competitions/CompThingCell.svelte';
	import CompetitorCell from '$lib/competitions/CompetitorCell.svelte';
  import AddCompetitor from '$lib/competitions/AddCompetitor.svelte';
	import ScoreCell from '$lib/competitions/ScoreCell.svelte';
  
	let nrounds = $derived($activeComp.children.map((stage) => stage.children.length));

	let showAddPilot = $state(false);
</script>

<div class="table-responsive">
	<table class="table table-bordered table-striped">
		<thead class="table-dark">
			<tr>
				<th>Competition:</th>
				<th colspan={sum(nrounds) + 4}><CompThingCell thing={$activeComp} /></th>
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
        {#if $activeComp.isMyComp}<td></td>{/if}
			</tr>
		</thead>
		<tbody>
			{#each $activeComp.competitors as competitor, i}
				<tr>
					<td><CompetitorCell {competitor} /></td>
					{#each $activeComp.children as stage}
						{#each stage.children as round}
              <td class="text-center">
                <ScoreCell {round} competitorID={competitor.competitor.id} />
              </td>
						{/each}
						<td></td>
					{/each}
          {#if $activeComp.isMyComp}<td></td>{/if}
				</tr>
			{/each}
			{#if $activeComp.isMyComp}
				<tr
					><td
						role="button"
						title="Add Pilot"
            class="text-center"
						onclick={() => {
							showAddPilot = !showAddPilot;
						}}
					>
						+
					</td>
          <td colspan={sum(nrounds)+4}></td>
        </tr>
			{/if}
		</tbody>
	</table>
</div>
<Popup bind:show={showAddPilot}>
  <AddCompetitor
    competition={$activeComp}
    onadded={() => {
      showAddPilot = false;
    }}
  />
</Popup>