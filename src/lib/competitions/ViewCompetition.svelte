<script lang="ts">
	import { activeComp } from '$lib/stores/contests';
	import { sum } from '$lib/utils/arrays';
	import Popup from '$lib/components/Popup.svelte';
	import CompThingCell from '$lib/competitions/compthings/CompThingCell.svelte';
	import CompetitorCell from '$lib/competitions/competitors/CompetitorCell.svelte';
	import AddCompetitor from '$lib/competitions/competitors/AddCompetitor.svelte';
	import ScoreCell from '$lib/competitions/competitors/ScoreCell.svelte';
	import { objmap } from '$lib/utils/arrays';
	let { display = $bindable('Results') }: { display: 'Results' | 'Running Order' } = $props();

	let nrounds = $derived($activeComp!.children.map((stage) => stage.children.length));

	let showAddPilot = $state(false);

	let cuts = $derived.by(() => {
		const cuts = Array($activeComp!.competitors.length).fill(undefined);
		$activeComp?.children.forEach((stage, i) => {
			const progress = stage.summary.result_rules?.progress_top_n;
			if (progress && progress < $activeComp.competitors.length) {
				cuts[progress] = [...(cuts[progress] || []), stage.summary.name];
			}
		});
		return cuts;
	});
	$inspect(cuts);
</script>

<div class="container-auto p-0">
	<div class="row-auto table-responsive p-0">
		<table class="table table-sm align-middle">
			<thead class="table-dark align-middle">
				<tr>
					<th>Competition:</th>
					<CompThingCell
						thing={$activeComp!}
						colspan={sum(nrounds) + nrounds.length + (display == 'Results' ? 2 : 0)}
					/>
				</tr>
				<tr>
					<th>Stages:</th>
					{#each $activeComp!.children as stage, i}
						<CompThingCell
							parent={$activeComp}
							thing={stage}
							colspan={nrounds[i] + (display == 'Results' ? 1 : 0)}
						/>
					{/each}
					{#if display == 'Results'}
						<th rowspan="2" class="text-center">Total</th>
					{/if}
				</tr>
				<tr>
					<th>Rounds:</th>
					{#each $activeComp!.children as stage, i}
						{#each stage.children as round}
							<CompThingCell parent={stage} thing={round} />
						{/each}
						{#if display == 'Results'}
							<th class="text-center">Total</th>
						{/if}
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each $activeComp!.sortCompetitors(display) as competitor, i}
					<tr class={cuts[i + 1] && display=="Results" ? 'cutrow' : ''}>
						<CompetitorCell {competitor} />
						{#each $activeComp!.children as stage, j}
							{#if display=="Results" && j > 0 && cuts[i]?.includes($activeComp?.children[j - 1].summary.name)}
								<td class="fs-6 lh-1 text-primary align-text-top py-1-0 b-0" colspan={stage.children.length + 1}>{$activeComp?.children[j - 1].summary.name} Cut</td>
							{:else}
								{#each stage.children as round}
									<ScoreCell {round} competitorID={competitor.competitor.id} bind:display />
								{/each}
								<ScoreCell
									round={stage}
									competitorID={competitor.competitor.id}
									bind:display
								/>
							{/if}
						{/each}

						<ScoreCell round={$activeComp!} competitorID={competitor.competitor.id} bind:display />
					</tr>
				{/each}
				{#if $activeComp!.isMyComp}
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
						<td colspan={sum(nrounds) + 4}></td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
<Popup bind:show={showAddPilot}>
	<AddCompetitor
		competition={$activeComp!}
		onadded={() => {
			showAddPilot = false;
		}}
	/>
</Popup>

<style>
	.cutrow {
		border-bottom: 1px solid var(--bs-primary);
	}
</style>
