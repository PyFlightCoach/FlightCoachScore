<script lang="ts">
	import { activeComp } from '$lib/stores/contests';
	import { sum } from '$lib/utils/arrays';
	import { createEmptyThing } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
  import CompThingCell from '$lib/competitions/CompThingCell.svelte';
	import AddCompetitor from '$lib/competitions/AddCompetitor.svelte';
  let {data} = $props();
  const isMyComp = $derived(data.isMyComp || false);
  
	let nrounds = $derived(
		($activeComp.children || []).map((stage) => (stage.children || []).length)
	);
	
  let showAddPilot = $state(false);
</script>

<div class="table-responsive">
	<table class="table table-bordered">
		<thead>
			<tr>
				<th>Competition:</th>
				<th colspan={sum(nrounds) + 3}><CompThingCell thing={$activeComp} {isMyComp}/></th>
			</tr>
			<tr>
				<th>Stages:</th>
				{#each $activeComp.children || [] as stage, i}
					<th colspan={nrounds[i] + (isMyComp ? 1 : 0)}><CompThingCell thing={stage} {isMyComp}/></th>
				{/each}
        {#if isMyComp}
          <th
            role="button"
            onclick={() => {
              createEmptyThing(`Stage ${($activeComp.children?.length || 0) + 1}`, $activeComp.id)
                .then(newComp=>{$activeComp=newComp});
            }} title="Create new stage">+</th
          >
        {/if}
			</tr>
			<tr>
				<th>Rounds:</th>
				{#each $activeComp.children || [] as stage, i}
					{#each stage.children || [] as round}
						<th><CompThingCell thing={round} {isMyComp}/></th>
					{/each}
          {#if isMyComp}
					<th role="button" onclick={() => {
						createEmptyThing(`Round ${(stage.children?.length || 0) + 1}`, stage.id)
              .then(newComp=>{$activeComp=newComp});
					}} title="Create new {stage.name} round">+</th>
          {/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $activeComp.competitors || [] as competitor, i}
				<tr>
					<td>{competitor.name}</td>
					{#each $activeComp.children || [] as stage}
						{#each stage.children || [] as round}
							{#if round.competitors && round.competitors[i].flight_id}
								<td class="">
									{round.competitors[i].raw_score}, {round.competitors[i].normalised_score}
								</td>
							{:else}
								<td class=""></td>
							{/if}
						{/each}
						<td></td>
					{/each}
				</tr>
			{/each}
      {#if isMyComp}
			  <tr><td role="button" title="Add Pilot" onclick={() => { showAddPilot = !showAddPilot; }}>
          +
        </td></tr>
        <Popup bind:show={showAddPilot}>
          <AddCompetitor compID={$activeComp.id} onadded={() => { showAddPilot = false; }} />
        </Popup>
      {/if}
		</tbody>
	</table>
</div>
