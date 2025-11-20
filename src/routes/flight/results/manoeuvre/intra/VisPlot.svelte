<script lang="ts">
	import type { Result } from '$lib/manoeuvre/scores';
	import Plot from '$lib/plots/Plotly.svelte';
	import { linspace } from '$lib/utils/arrays';
	import type { DownGrade } from '$lib/manoeuvre/definition.svelte';

	export let result: Result | undefined;
	export let downgrade: DownGrade | undefined;
	export let vis: number | undefined;

	//	$: x = linspace(0, downgrade.criteria.lookup.limit*2, 100);
	$: errlim = downgrade
		? (downgrade.criteria.lookup.limit / downgrade.criteria.lookup.factor) **
			(1 / downgrade.criteria.lookup.exponent)
		: undefined;
	$: scale = result?.scale();
	$: x = errlim ? linspace(0.0, scale! * errlim * 1.5, 50) : undefined;
</script>

<Plot
	data={[
		{
			type: 'scatter',
			x,
			y: x
				? x.map((v) => {
						const norm = Math.abs(v / (errlim * scale));
						return scale * errlim * (norm >= 1 ? norm : norm ** (2 - vis));
					})
				: undefined,
			line: { color: 'black' },
			showlegend: false
		}
	]}
	layout={{
		yaxis: { title: 'visible error' },
		xaxis: { title: 'real error' },
		autosize: true,
		margin: { l: 40, r: 0, t: 0, b: 40 }
	}}
	config = {{staticPlot: true, responsive: true}}
/>
