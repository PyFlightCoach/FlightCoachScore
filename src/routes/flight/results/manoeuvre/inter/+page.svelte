<script lang="ts">
	import { analyses, selManID, fcj } from '$lib/stores/analysis';
	import PlotInter from '$lib/plots/PlotInter.svelte';
  import { d3Color } from '$lib/plots/styling';
  import {isFullSize} from '$lib/stores/shared';
	
	const man = analyses[$selManID!];

	let states = $derived($man!.flown!.split());

	let name: string | undefined = $state();
	let mp = $derived(name ? $man!.mdef!.mps[name] : undefined);
	let result = $derived(name ? $man!.scores!.inter.data[name] : undefined);


</script>

<div class="col-md-4 pt-3 bg-light border">
  <div class="row pt-2 px-2">
		<label class="col col-form-label" for="criteriaTable">Select DG:</label>
		{#if name}
			<button
				class="col btn btn-sm btn-outline-secondary"
				onclick={() => {
					name = undefined;
				}}>Clear</button
			>
		{/if}
	</div>
  <div class="row pt-2">
	<div class="table-responsive">
		<table class="table border">
			<thead>
				<tr>
					<th></th>
					<th scope="col">Parameter</th>
					<th scope="col">Downgrade</th>
				</tr>
			</thead>
			<tbody>
				{#if $man?.scores}{#each Object.values($man.scores.inter.data) as mp, i}
						<tr>
							<td>
								<input
									class="form-check-input"
									type="radio"
									name="manSelect"
									bind:group={name}
									value={mp.name}
								/>
							</td>
							<td>{mp.name}</td>
							<td>{mp.total.toFixed(2)}</td>
						</tr>
					{/each}{/if}
			</tbody>
		</table>
	</div>
</div>
	{#if result && mp}
  <div class="row">
		<div class="table-responsive">
			<table class="table table-sm table-bordered">
				<thead>
					<tr>
						<th scope="col" class="col-1">Value</th>
						<th scope="col" class="col-1">Error</th>
						<th scope="col" class="col-1">Visibility</th>
						<th scope="col" class="col-1">DownGrade</th>
            <th scope="col" class="col-3" >Collector</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.values(mp.collectors) as col, i}
						<tr>
							<td>{result.sample[i].toFixed(2)}</td>
							<td>{result.errors[i].toFixed(2)}</td>
							<td>{result.measurement.visibility[i].toFixed(2)}</td>
							<td>{result.dgs[i].toFixed(2)}</td>
              <td class="overflow-auto text-nowrap">{col}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
  </div>
	{/if}
</div>
<div class="col-md-8 flex-grow-1 d-flex flex-column">
  <div class="row flex-grow-1" style="min-height:450px">
	<PlotInter
		sts={states}
		activeEls={mp ? mp.getCollectorEls(Object.keys($man!.mdef!.eds)) : undefined}
		sp={$isFullSize ? 2.5 : 1}
	/>
</div>
</div>
