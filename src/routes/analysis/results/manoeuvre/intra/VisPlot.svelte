<script lang="ts">
	import type { Result } from '$lib/analysis/scores';
	import Plot from 'svelte-plotly.js';
	import { linspace } from '$lib/utils/arrays';
	import type { DownGrade } from '$lib/analysis/mandef';
	
	export let result: Result;
	export let downgrade: DownGrade;
  export let vis: number;
	
//	$: x = linspace(0, downgrade.criteria.lookup.limit*2, 100);
  $: errlim = (downgrade.criteria.lookup.limit / downgrade.criteria.lookup.factor) ** (1 / downgrade.criteria.lookup.exponent)

  $: x = linspace(0.0, scale * errlim * 1.5, 50);
    
  $: scale = result.scale();
</script>

<div>
  
	<Plot
		data={[
			{
				type: 'scatter',
				x,
				y: x.map((v) =>{
          const norm = Math.abs(v / (errlim*scale));
          return scale * errlim * (norm >= 1 ? norm : norm ** (2 - vis))
        }),
				line: { color: 'black' },
				showlegend: false
			}
		]}
		layout={{
			yaxis: { title: 'visible error' },
			xaxis: { title: 'real error'},
			autosize: true,
			margin: { l: 40, r: 0, t: 0, b: 40 }
		}}
		fillParent={true}
	/>
</div>
