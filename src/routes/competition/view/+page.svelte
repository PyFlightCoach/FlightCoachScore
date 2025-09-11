<script lang="ts">
	import { activeComp, setComp } from '$lib/stores/contests';
	import { sum } from '$lib/utils/arrays';
	import Popup from '$lib/components/Popup.svelte';
	import CompThingCell from '$lib/competitions/compthings/CompThingCell.svelte';
	import CompetitorCell from '$lib/competitions/competitors/CompetitorCell.svelte';
  import AddCompetitor from '$lib/competitions/competitors/AddCompetitor.svelte';
	import ScoreCell from '$lib/competitions/competitors/ScoreCell.svelte';
  
	let nrounds = $derived($activeComp.children.map((stage) => stage.children.length));

	let showAddPilot = $state(false);

  $inspect("activeComp", $activeComp);
</script>

<div class="table-responsive p-0">
	<table class="table table-striped table-sm align-middle table-borderless">
		<thead class="table-dark align-middle">
			<tr>
				<th>Competition:</th>
				<CompThingCell competition={$activeComp} thing={$activeComp} colspan={sum(nrounds) + nrounds.length + 2}/>
			</tr>
			<tr>
				<th>Stages:</th>
				{#each $activeComp.children as stage, i}
            <CompThingCell competition={$activeComp} parent={$activeComp} thing={stage} colspan={nrounds[i] + 1}/>
				{/each}
        <th rowspan="2" class="text-center">Total</th>
			</tr>
			<tr>
				<th>Rounds:</th>
				{#each $activeComp.children as stage, i}
					{#each stage.children as round}
						<CompThingCell competition={$activeComp} thing={round} />
					{/each}
          <th class="text-center">Total</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $activeComp.competitors as competitor, i}
				<tr>
					<CompetitorCell {competitor} />
					{#each $activeComp.children as stage}
						{#each stage.children as round}
              <ScoreCell {round} competitorID={competitor.competitor.id} />
						{/each}
						<ScoreCell round={stage} competitorID={competitor.competitor.id} />
					{/each}
          <ScoreCell round={$activeComp} competitorID={competitor.competitor.id} />
				</tr>
			{/each}
			{#if $activeComp.isMyComp}
				<tr
					><td
						role="button"
						title="Add Pilot"
            class="btn btn-outline-secondary w-100 h-100"
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