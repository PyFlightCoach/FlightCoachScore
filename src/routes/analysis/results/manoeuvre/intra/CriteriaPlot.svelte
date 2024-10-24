<script lang="ts">
	import type { Result } from '$lib/analysis/scores';
	import Plot from 'svelte-plotly.js';
	import { linspace } from '$lib/utils/arrays';
	import type { DownGrade } from '$lib/analysis/mandef';

	export let result: Result;
	export let downgrade: DownGrade;

	$: scale = result.scale();

	$: x = result.measurement.unit.includes('rad')
		? linspace(0.0, 120.0, 20.0)
		: linspace(0.0, Math.max(Math.max(...result.errors), -Math.min(...result.errors)) * 2, 20.0);
</script>

<div>
  <Plot
    data={[
      {
        type: 'scatter',
        x,
        y: x.map((v) =>
          Math.min(
            downgrade.criteria.lookup.factor *
              Math.pow(v / scale, downgrade.criteria.lookup.exponent),
            downgrade.criteria.lookup.limit
          )
        ),
        line: { color: 'black' },
        showlegend: false
      },
      {
        type: 'scatter',
        x: result.errors.map((v) => Math.abs(v * scale)),
        y: result.dgs,
        text: result.dgs.map((dg) => dg.toFixed(3)),
        mode: 'markers+text',
        showlegend: false,
        textposition: 'bottom center',
        marker: {
          size: 12,
          color: result.dgs,
          colorscale: 'Reds'
        },
        hovertext: result.info()
      }
    ]}
    layout={{
      yaxis: { title: 'downgrade' },
      xaxis: { title: downgrade.criteria.kind + ' error' },
      autosize: true,
      margin: { l: 40, r: 0, t: 0, b: 40 }
    }}
    fillParent={true}
  />
</div>