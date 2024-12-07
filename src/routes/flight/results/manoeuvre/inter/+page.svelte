<script lang="ts">
	import { analyses, selManID, fcj } from '$lib/stores/analysis';
	import PlotInter from '$lib/components/plots/PlotInter.svelte';
	import { d3Color, colscale, redsColors } from '$lib/components/plots/styling.js';
	import type { Result } from '$lib/analysis/scores';
	import { includes } from 'lodash';
	import { ManParm } from '$lib/analysis/mandef';

	$: man = analyses[$selManID!];
	$: states = $man!.flown!.split();
	let activeMP: ManParm | undefined;

	//{#each Object.values(mp.collectors) as co, i}
	//  {activeMP.sample[i].toFixed(2)}
	//  {activeMP.errors[i].toFixed(2)}
	//  {activeMP.measurement.visibility[i].toFixed(2)}
	//  {activeMP.dgs[i].toFixed(2)}
	//{/each}
</script>

{#if $man && $man.scores && $man.mdef}
	<div class="col-4 pt-3 border">
		{activeMP?.name || 'no active result'}
		<accordion class="accordion" id="interAccordion">
			{#each Object.values($man.scores.inter.data) as mp, i}
				<div class="accordion-item">
					<h2 class="accordion-header">
						<button
							class="accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#{mp.name}"
							aria-expanded="false"
							aria-controls={mp.name}
							on:click={(e: Event) => {
								if (!(e.target.attributes.class.nodeValue.includes('collapsed') || false)) {
									activeMP = $man.mdef.mps[mp.name];
								} else {
									activeMP = undefined;
								}
							}}
						>
							{mp.name}, dg = {mp.total.toFixed(2)}
						</button>
					</h2>
					<div id={mp.name} class="accordion-collapse collapse" data-bs-parent="#interAccordion">
						<div class="accordion-body">
              <div class="table-responsive">
							<table class="table table-sm table-bordered">
								<thead>
									<tr>
										<th scope="col" class="col-3 overflow-scroll">Collector</th>
										<th scope="col" class="col-1">Value</th>
										<th scope="col" class="col-1">Error</th>
										<th scope="col" class="col-1">Visibility</th>
										<th scope="col" class="col-1">DownGrade</th>
									</tr>
								</thead>
								<tbody>
                  {#if activeMP && activeMP.name === mp.name}
									{#each Object.values(activeMP.collectors) as col, i}
										<tr>
                      <td style="overflow:hidden; text-overflow:ellipsis; white-space: nowrap;">{col}</td>
                      <td>{mp.sample[i].toFixed(2)}</td>
                      <td>{mp.errors[i].toFixed(2)}</td>
                      <td>{mp.measurement.visibility[i].toFixed(2)}</td>
                      <td>{mp.dgs[i].toFixed(2)}</td>
											
										</tr>
									{/each}
                  {/if}
								</tbody>
							</table>
            </div>
						</div>
					</div>
				</div>
			{/each}
		</accordion>
	</div>
	<div class="col-8 border">
		<PlotInter
			sts={states}
			activeEls={activeMP ? activeMP.getCollectorEls(Object.keys($man.mdef.eds)) : undefined}
      sp={1.5}
		/>
	</div>
{:else}
	<div>no data</div>
{/if}
