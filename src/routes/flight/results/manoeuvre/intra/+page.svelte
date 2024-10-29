<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import PlotDTW from '$lib/components/plots/PlotDTW.svelte';
	import { analyses, selManID } from '$lib/stores/analysis';
	import type { States } from '$lib/analysis/state';
	import CriteriaPlot from './CriteriaPlot.svelte';
	import VisPlot from './VisPlot.svelte';
	import DGPlot from './DGPlot.svelte';
	import ColouredTable from '$lib/components/ColouredTable.svelte';

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
	$: dg = activeED?.getDG(activeCriteria);

	$: element = $man!.manoeuvre!.getEl(activeED?.name);

	$: result =
		activeDGName && activeCriteria
			? $man?.scores!.intra.data[activeDGName].data[activeCriteria]
			: undefined;
</script>

<div class="col-4 pt-3 border">
	<ColouredTable data={summaries} bind:activeRow={activeDGName} bind:activeCol={activeCriteria} />
</div>

<div class="col-8 d-flex flex-column">
	{#if !activeCriteria}
		{#if !activeED}
			<PlotDTW sts={states} bind:activeEl={activeED} sp={4} />
		{:else}
			<PlotSec
				flst={states[activeED.name].move(templates[activeED.name].data[0].pos)}
				tpst={templates[activeED.name]}
				bind:i={activeIndex}
				controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
				fixRange
				scale={3}
			/>
		{/if}
	{:else}
		<div class="col-12 flex-grow-1 border d-flex flex-row">
			<div class="col-6 border">
				<PlotSec
					flst={states[activeED.name].move(templates[activeED.name].data[0].pos)}
					tpst={templates[activeED.name]}
					bind:i={activeIndex}
					controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
					fixRange
					scale={3}
				/>
			</div>

			<div class="col-6 d-flex flex-column border">
				<div class="col-12 border">
					{#if activeCriteria && dg && element && result}
						<table>
							<tbody>
								<tr><td>Measurement: </td> <td> {dg.measure}</td></tr>
								<tr><td>Element: </td> <td> {element.describe()}</td></tr>
								<tr><td>Sample: </td> <td> {dg.describe_selectors()}</td></tr>
								<tr>
									<td>Smoothing: </td>
									<td> {dg.smoothers.length > 0 ? dg.smoothers : 'None'}</td>
								</tr>
								<tr><td>Criteria: </td> <td> {dg.criteria_description(result)}</td></tr>
							</tbody>
						</table>
					{/if}
				</div>
				<div class="col-12 flex-grow-1 d-flex flex-row border">
					<div class="col-6">
						<VisPlot
							{result}
							downgrade={dg}
							vis={activeIndex ? result?.measurement.visibility[activeIndex] : undefined}
						/>
					</div>
					<div class="col-6">
						<CriteriaPlot {result} downgrade={dg} />
					</div>
				</div>
			</div>
		</div>
		<div class="col-12 flex-grow-1 border">
			{#if result && dg && activeCriteria}
				<DGPlot {result} bind:activeIndex />
			{/if}
		</div>
	{/if}
</div>
