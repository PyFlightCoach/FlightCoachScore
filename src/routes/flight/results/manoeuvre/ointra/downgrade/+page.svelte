<script lang="ts">
	import type { ManDef } from '$lib/analysis/mandef.js';
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import VisPlot from '../../intra/VisPlot.svelte';
	import CriteriaPlot from '../../intra/CriteriaPlot.svelte';
	import DGPlot from '../../intra/DGPlot.svelte';

	const { data } = $props();

	let analysis = data.analysis;
	let states = $derived($analysis!.flown!.split());
	let templates = $derived($analysis!.template!.split());

	let activeED = $derived(($analysis!.mdef! as ManDef).getEd(data.element));
	let dg = $derived(activeED?.getDG(data.dg)!);

	let element = $derived($analysis!.manoeuvre!.getEl(data.element)!);
	let result = $derived($analysis!.scores!.intra.data[data.element].data[data.dg]);

	let activeIndex = $state(0);
</script>

<div class="col-md-6 border" style="height:450px">
	<PlotSec
		flst={states[data.element].move(templates[data.element].data[0].pos)}
		tpst={templates[data.element]}
		bind:i={activeIndex}
		controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
		fixRange
		scale={0.4}
		expand={40}
	/>
</div>

<div class="col-md-6">
	<div class="row">
		<div class="table-responsive small">
			<table class="table table-sm">
				<tbody>
					<tr><td>Measurement:</td> <td> {dg?.measure}</td></tr>
					<tr><td>Element:</td> <td> {element?.describe()}</td></tr>
					<tr><td>Sample:</td> <td> {dg?.describe_selectors()}</td></tr>
					<tr>
						<td>Smoothing: </td>
						<td> {dg?.smoothers.length > 0 ? dg.smoothers : 'None'}</td>
					</tr>
					<tr><td>Criteria: </td> <td> {dg?.criteria_description(result)}</td></tr>
				</tbody>
			</table>
		</div>
	</div>
	<div class="row" style="height: 300px;">
		<div class="col-6">
			<CriteriaPlot {result} downgrade={dg} />
		</div>
		<div class="col-6">
			{#if activeIndex}
				<VisPlot
					{result}
					downgrade={dg}
					vis={activeIndex ? result?.measurement.visibility[activeIndex] : undefined}
				/>
			{:else}
				<span>Select a data point to view visibility</span>
			{/if}
		</div>
	</div>
</div>

<div class="col">
	<DGPlot {result} bind:activeIndex />
</div>
