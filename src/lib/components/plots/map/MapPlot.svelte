<script lang="ts">
  import Plot from 'svelte-plotly.js';
  import {BinData} from '$lib/components/bin';
	import type { Origin } from '$lib/analysis/fcjson';
  import {binDataMapTrace, originMapTraces} from './mapTraces';
	import { GPS } from '$lib/analysis/geometry';

  export let defaultOrigin: GPS = new GPS(0, 0, 0);
  export let binData: BinData | undefined = undefined;
  export let origin: Origin | undefined = undefined;
  export let kind: string = 'F3A';

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
					lat: binData?.pos.Lat[0] || origin?.lat || defaultOrigin.lat,
					lon: binData?.pos.Lng[0] || origin?.lng || defaultOrigin.lon
				},
				pitch: 0,
				zoom: 13,
				style: 'satellite'
			},
			margin: { l: 0, r: 0, t: 0, b: 0 }
		}}
		fillParent={true}
	/>