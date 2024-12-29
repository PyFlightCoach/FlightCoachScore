<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import PlotDTW from '$lib/components/plots/PlotDTW.svelte';
	import { analyses, selManID, isFullSize } from '$lib/stores/analysis';
	import type { States } from '$lib/analysis/state';
	import ColouredTable from '$lib/components/ColouredTable.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';


  
	$: man = analyses[$selManID!];

	$: summaries = $man!.scores!.intra.summaries();

	let states: Record<string, States>;
	let templates: Record<string, States>;
	$: states = $man!.flown!.split();
	$: templates = $man!.template!.split();

	let activeCriteria: undefined | string;
	let activeDGName: undefined | string;
	let activeIndex: undefined | number = 0;

	$: activeED = $man!.mdef!.getEd(activeDGName);

	let plotModal: HTMLDialogElement | undefined;
</script>

<div class="col-auto pt-5">
	<ColouredTable
		data={summaries}
		bind:activeRow={activeDGName}
		bind:activeCol={activeCriteria}
		on:select={(e) => {
			console.log(e.detail.row, e.detail.col);
			if (e.detail.row && e.detail.col) {
				goto(
					`${base}/flight/results/manoeuvre/intra/downgrade?element=${e.detail.row}&dg=${e.detail.col}`
				);
			} else if (e.detail.row && plotModal) {
				plotModal.show();
			} else if (e.detail.col && plotModal) {
				plotModal.showModal();
			}
		}}
	/>
</div>

{#if activeDGName}
	<div
		class="container position-fixed d-flex flex-row justify-content-center pt-5 border"
	>
		<div class="row">
			<h5 class="col">Modal title</h5>
			<button type="button" class="close col-auto" on:click={() => (activeDGName = undefined)}>
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="row">
			<div class="col">
				{#if !activeCriteria}
					{#if !activeED}
						<PlotDTW sts={states} bind:activeEl={activeED} sp={$isFullSize ? 10 : 4} />
					{:else}
						<PlotSec
							flst={states[activeED.name].move(templates[activeED.name].data[0].pos)}
							tpst={templates[activeED.name]}
							bind:i={activeIndex}
							controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
							fixRange
							scale={0.2}
							expand={40}
						/>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}
