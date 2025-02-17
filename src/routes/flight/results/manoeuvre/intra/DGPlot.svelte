<script lang="ts">
	import type { Result } from '$lib/manoeuvre/scores';
	import Plot from '$lib/plots/Plotly.svelte';
	import { linspace } from '$lib/utils/arrays';

  let {result, activeIndex=$bindable(0)} : {result: Result; activeIndex?: number} = $props();
	
  const scale = $derived(result.scale());
  const unit = $derived(result.measurement.unit.replace('rad', 'deg'));
  const x = $derived(linspace(0, result.measurement.value.length - 1, result.measurement.value.length));
</script>

<Plot
	data={[
		{
			type: 'scatter',
			x,
			y: result.measurement.value.map((p) => {
				if (p != null) {
					return p * scale;
				} else {
					return null;
				}
			}),
			name: 'measurement',
			line: { color: 'black', width: 1 },
			yaxis: 'y'
		},
		{
			type: 'scatter',
			x,
			y: result.measurement.visibility,
			name: 'visibility',
			line: { color: 'blue', width: 1, dash: 'dot' },
			yaxis: 'y2'
		},
		{
			type: 'scatter',
			x,
			y: result.raw_sample.map(v=>v*scale),
			name: 'raw sample',
			line: { width: 1, color: 'grey' }
		},
		{
			type: 'scatter',
			x: result.sample_keys,
			y: result.sample.map((p) => {
				if (p != null) {
					return p * scale;
				} else {
					return null;
				}
			}),
			name: 'smooth sample',
			line: { width: 3, color: 'green' }
		},
		{
			type: 'scatter',
			x: result.keys.map((k) => result.sample_keys[k]),
			y: result.keys.map((k) => result.sample[k] * scale),
			text: result.dgs.map((dg) => dg.toFixed(3)),
			hovertext: result.info(),
			name: 'downgrade',
			mode: 'markers+text',
			marker: {
				size: 12,
				color: result.dgs,
				colorscale: 'Reds'
			},
			textposition: 'bottom center'
		}
	]}
	layout={{
		yaxis: {
			title: 'measurement (' + unit + ')'
		},
		yaxis2: {
			title: 'visibility',
			overlaying: 'y',
			side: 'right',
			range: [0, 1]
		},
		xaxis: {
			visible: false,
			range: [0, result.measurement.value.length]
		},
		hovermode: 'x unified',
		legend: { orientation: 'h', x: 0.2, y: 0 },
		autosize: true,
		margin: { l: 60, r: 70, t: 0, b: 0 },
		shapes: [
			{
				type: 'line',
				x0: activeIndex,
				y0: 0,
				x1: activeIndex,
				y1: 1,
				yref: 'paper',
				line: { color: 'black', width: 1 }
			}
		],
		modebar: { orientation: 'v' }
	}}
	onclick={(e) => {
    console.log(e);
		activeIndex = e.points[0].x as number;
	}}
/>
