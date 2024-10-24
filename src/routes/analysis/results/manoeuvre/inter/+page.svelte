<script lang="ts">
	import { analyses, selManID, fcj } from '$lib/stores/analysis';
	import PlotInter from '$lib/components/plots/PlotInter.svelte';
	import { d3Color, colscale, redsColors } from '$lib/components/plots/styling.js';

	$: man = analyses[$selManID!];
	$: states = $man?.flown.split();
</script>

{#if man}
	<div class="accordion">
		{#each Object.values($man.mdef.mps) as mp, i}
			<div class="accordion-item">
				<span class="accordion-header">
					<button
						class="accordion-button"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#collapse{i}"
						aria-expanded="true"
						aria-controls="collapse{i}"
					>
						{mp.name} (dg={mp.name in $man.scores.inter.data
							? $man.scores.inter.data[mp.name].total.toFixed(2)
							: 0})
					</button>
				</span>

				<div
					id="collapse{i}"
					class="accordion-collapse collapse"
					aria-labelledby="headingOne"
					data-bs-parent="#accordionExample"
				>
					<div class="accordion-body">
						{#if mp.name in $man.scores.inter.data}
							<div class="container-fluid">
								<div class="col-5">
									<div class="row">
										<div class="col-1">Collector</div>
										<div class="col-1">Value</div>
										<div class="col-1">Error</div>
										<div class="col-1">Visibility</div>
										<div class="col-1">Downgrade</div>
									</div>
									{#each Object.values(mp.collectors) as co, i}
										<div class="row">
											<div class="col-1" style:background-color={d3Color(i)}>{co}</div>
											<div class="col-1">
												{$man.scores.inter.data[mp.name].sample[i].toFixed(2)}
											</div>
											<div class="col-1">
												{$man.scores.inter.data[mp.name].errors[i].toFixed(2)}
											</div>
											<div class="col-1">
												{$man.scores.inter.data[mp.name].measurement.visibility[i].toFixed(2)}
											</div>
											<div
												class="col-1"
												style:background-color={colscale(
													$man.scores.inter.data[mp.name].dgs[i],
													$man.scores.inter.data[mp.name].total,
													redsColors
												)}
											>
												{$man.scores.inter.data[mp.name].dgs[i].toFixed(2)}
											</div>
										</div>
									{/each}
								</div>

								<div class="col-7">
									<PlotInter
										sts={states}
										activeEls={mp.getCollectorEls(Object.keys($man.mdef.eds))}
									/>
								</div>
							</div>
						{:else}
							<p>
								This parameter is not downgradable. This is probably because it is just used to
								ensure the correct manoeuvre is flown by constraining the options on roll direction.
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div>no data</div>
{/if}
