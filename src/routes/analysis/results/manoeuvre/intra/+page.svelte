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
  <p>showing criteria: {activeCriteria}</p>
  <p>showing ED:       {activeED?.name}</p>
</div>

<div class="col-8 border  d-flex  ">
	
		{#if !activeED}
			<PlotDTW sts={states} bind:activeEl={activeDGName} sp={4} />
		{:else}
    
			<div class="row flex-grow-1 border">

				<div class="col-{activeCriteria ? '6' : '12'} border d-flex ">
					<PlotSec
						flst={states[activeED.name].move(templates[activeED.name].data[0].pos)}
						tpst={templates[activeED.name]}
						bind:i={activeIndex}
						controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
						fixRange
						scale={3}
					/>
				</div>

				{#if activeCriteria && dg && element && result}
					<div class="col-6">
						<div class="row">
							<div class="description">
								<div class="row">Measurement: {dg.measure}</div>
								<div class="row">Element: {element.describe()}</div>
								<div class="row">Sample: {dg.describe_selectors()}</div>
								<div class="row">Smoothing: {dg.smoothers.length > 0 ? dg.smoothers : 'None'}</div>
								<div class="row">Criteria: {dg.criteria_description(result)}</div>
							</div>
						</div>
            <div class="row">
						{#if activeIndex }
							<VisPlot {result} downgrade={dg} vis={result.measurement.visibility[activeIndex]} />
						{/if}
						<CriteriaPlot {result} downgrade={dg} />
          </div>
					</div>
				{/if}
			</div>
		{/if}
	
</div>
