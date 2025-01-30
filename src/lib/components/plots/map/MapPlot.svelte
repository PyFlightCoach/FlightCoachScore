<script lang="ts">
  import Plot from 'svelte-plotly.js';
  import {binDataMapTrace, originMapTraces} from './mapTraces';
	import { GPS } from '$lib/utils/geometry';
	import type { BinData } from '$lib/components/bin';
	import type { Origin } from '$lib/flight/fcjson';

  export let origin: Origin |undefined;
  export let binData: BinData | undefined;
  export let kind: string = 'F3A';

  let centre: GPS | undefined;
  
  $: if (binData) {
    centre = new GPS(binData?.pos.Lat[0], binData?.pos.Lng[0], 0);
  }

  $: if (origin) {
    centre = new GPS(origin?.lat, origin.lng, 0);
  }

</script>


<Plot
		data={
      [
        ...(binData ? [binDataMapTrace(binData)] : []),
        ...(origin ? originMapTraces(origin, kind) : [])
      ]
  }
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
		fillParent={true}
	/>