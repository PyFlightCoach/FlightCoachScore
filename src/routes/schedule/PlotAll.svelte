<script lang="ts">
	import PlotDtw from '$lib/components/plots/PlotDTW.svelte';
	import { mans, rule } from '$lib/schedules/schedule_builder';

  
</script>

<div style="position:relative; height: 100%;">
	<div
		class="container-fluid px-4 d-flex flex-column"
		style="overflow-x:hidden; overflow-y:auto; position: absolute; top: 0; left: 0; bottom: 0; right: 0;"
	>
		<div class="row">
			{#each $mans as ol, i}
				<div class="col-md-6 col-lg-4 border">
					<div class="row text-center">
						<lead class="col-1">{i + 1}</lead>
						<lead class="col-9 text-nowrap">{ol.aresti?.info.name}</lead>
						<lead class="col-1">{ol.aresti?.info.k}</lead>
					</div>
					<div class="row" style="height:400px">
						{#if ol.template}
							<PlotDtw
								sts={ol.template.split()}
								sp={['f3a', 'IMAC'].includes($rule) ? 10 : 20}
								expand={20}
                hideAxes
                canSelect={false}
                hoverinfo="none"
							/>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
