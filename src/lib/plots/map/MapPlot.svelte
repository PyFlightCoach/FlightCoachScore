<script lang="ts">
	import Plot from '$lib/plots/Plotly.svelte';
	import { mapTrace, originMapTraces } from './mapTraces';
	import { GPS, Point } from '$lib/utils/geometry';
	import type { Origin } from '$lib/flight/fcjson';

	let {
		origin = $bindable(),
		data = $bindable(),
		kind = $bindable('F3A')
	}: { origin: Origin | undefined; data: GPS[]; kind: 'F3A' | 'IMAC' | 'IAC' } = $props();

  let nedCentre = $derived(
    origin ? new Point(Math.cos(origin.heading), Math.sin(origin.heading), 0) : new Point(150, 0, 0)
  );

	let centre: GPS | undefined = $derived(
		(origin ? new GPS(origin.lat, origin.lng, origin.alt) : data[0]).offset(nedCentre)
	);


</script>

<Plot
	data={[
		...(data ? [mapTrace(data)] : []),
		...(origin ? originMapTraces(origin, kind) : [])
	]}
	layout={{
		map: {
			bearing: 0,
			center: {
				lat: centre?.lat,
				lon: centre?.lon
			},
			pitch: 0,
			zoom: 13,
			style: 'satellite'
		},
		margin: { l: 0, r: 0, t: 0, b: 0 }
	}}
/>
