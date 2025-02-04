<script lang="ts">
	import { selManID, analyses, isFullSize } from '$lib/stores/analysis';
	import PlotDTW from '$lib/components/plots/PlotDTW.svelte';
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import DGPlot from './DGPlot.svelte';
	import CriteriaPlot from './CriteriaPlot.svelte';
	import { d3Color } from '$lib/components/plots/styling';
	import { objmap } from '$lib/utils/arrays';
	import { windowWidth } from '$lib/stores/shared';
	import VisPlot from './VisPlot.svelte';
	import { find } from 'lodash';

  const md = $derived($windowWidth >= 768);

	const man = analyses[$selManID!];

	let activeIndex = $state(0);

	let states = $derived($man!.flown!.split());
	let templates = $derived($man!.template!.split());
	let selectedElement: string = $state('All');
	let selectedDg: string | undefined = $state(undefined);

	let elres = $derived(selectedElement ? $man!.scores?.intra.data[selectedElement] : undefined);
	let resdg = $derived(elres && selectedDg ? elres.data[selectedDg] : undefined);
	let el = $derived(selectedElement ? $man!.mdef?.eds[selectedElement] : undefined);
	let eldg = $derived(selectedDg && el ? el?.dgs[selectedDg] : undefined);
	let field_totals = $derived($man!.scores?.intra.field_totals());
	let dgs = $derived(elres?.values() || field_totals);

	let summaries = $derived($man!.scores?.intra.summaries());

	let eltotals = $derived(
		summaries
			? objmap(summaries, (v: Record<string, number>) => v[selectedDg || 'Total'])
			: undefined
	);

  $inspect($man);
</script>

{#snippet plotsec()}
	<PlotSec
		flst={states[selectedElement].move(templates[selectedElement].data[0].pos)}
		tpst={templates[selectedElement]}
		bind:i={activeIndex}
		controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
		fixRange
		scale={0.4}
		expand={40}
	/>
{/snippet}

{#snippet critplot()}
	<CriteriaPlot result={resdg} downgrade={eldg} />
{/snippet}

{#snippet visplot()}
	<VisPlot
		result={resdg}
		downgrade={eldg}
		vis={activeIndex ? resdg?.measurement.visibility[activeIndex] : 1}
	/>
{/snippet}

<div class="col-md-4 pt-3 bg-light border">
	<div class="row">
		<label class="col col-form-label" for="select-element">Select Element:</label>
		<select
			class="col form-select"
			bind:value={selectedElement}
			onchange={() => {
				if (!Object.keys($man!.scores!.intra.data).includes(selectedElement)) {
					selectedDg = undefined;
				}
			}}
		>
			<option value="All">All</option>
			{#if $man!.scores}
				{#each Object.keys($man!.scores!.intra.data) as elName, i}
					<option value={elName} style="background-color: {d3Color(i)};">{elName}</option>
				{/each}
			{/if}
		</select>
	</div>
	<div class="row pt-2">
		<label class="col col-form-label" for="criteriaTable">Select Criteria:</label>
		{#if selectedDg}
			<button
				class="col btn btn-sm btn-outline-secondary"
				onclick={() => {
					selectedDg = undefined;
				}}>Clear Criteria</button
			>
		{/if}
	</div>
	<div class="row pt-2">
		<div class="table-responsive">
			<table class=" table {!md ? 'small table-sm' : ''} border" id="criteriaTable">
				<thead
					><tr>
						<th></th>
						<th>Name</th>
						<th>Value</th>
					</tr></thead
				>
				<tbody>
					{#each dgs ? Object.entries(dgs) : [] as [name, value]}
						<tr>
							<td>
								<input
									class="form-check-input"
									type="radio"
									name="manSelect"
									bind:group={selectedDg}
									value={name}
								/>
							</td>
							<td>{name}</td>
							<td>{value?.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{#if resdg && eldg}
		<div class="row">
			<div class="table-responsive">
				<table class="table border {!md ? 'small table-sm' : ''}">
					<tbody>
						<tr><td>Measurement:</td> <td> {eldg?.measure}</td></tr>
						<tr
							><td>Element:</td>
							<td>
								{$man!.manoeuvre!.getEl(selectedElement)?.describe()}
							</td></tr
						>
						<tr><td>Sample:</td> <td> {eldg?.describe_selectors()}</td></tr>
						<tr>
							<td>Smoothing: </td>
							<td> {eldg.smoothers.length > 0 ? eldg.smoothers : 'None'}</td>
						</tr>
						<tr><td>Criteria: </td> <td> {eldg?.criteria_description(resdg)}</td></tr>
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<div class="col-md-8 flex-grow-1 d-flex flex-column">
	{#if selectedElement == 'All' || !selectedDg}
		<div class="row flex-grow-1" style="min-height:450px">
			{#if selectedElement == 'All'}
				<PlotDTW
					sts={states}
					sp={$isFullSize ? 10 : 4}
					bind:activeEl={selectedElement}
					defaultValue="All"
					labels={eltotals ? objmap(eltotals, (v) => v?.toFixed(2)) : {}}
				/>
			{:else if !selectedDg}
				{@render plotsec()}
			{/if}
		</div>
	{/if}

	{#if selectedElement != 'All' && resdg}
		<div class="row flex-grow-1">
			<div class="col-md-8" style="min-height: 400px;">
				{@render plotsec()}
			</div>
			{#if md}
				<div class="col-md-4 d-flex flex-column">
					<div class="col">
						{@render critplot()}
					</div>
					<div class="col">
						{@render visplot()}
					</div>
				</div>
			{:else}
				<div class="col-md-4 d-flex flex-col">
					<div class="row flex-grow-1" style="min-height: 200px;">
						{@render critplot()}
					</div>
					<div class="row flex-grow-1" style="min-height: 200px;">
						{@render visplot()}
					</div>
				</div>
			{/if}
		</div>
		<div class="row" style="min-height:250px;">
			<DGPlot result={resdg} bind:activeIndex />
		</div>
	{/if}
</div>
