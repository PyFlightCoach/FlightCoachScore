<script lang="ts">
	import Plot from 'svelte-plotly.js';
	import { table_rows } from '$lib/stores/leaderboards';
  import { type DBFlightRanked, DBFlightStack, stackFlights } from '$lib/database/interfaces';

  let stacks: DBFlightStack[] = [];
  $: if ($table_rows) stacks=stackFlights($table_rows, 300);

  const fArr = (data: Record<string, any>[], field: string, fun = v=>v) =>  {
    return data.map(row => fun(row[field]));
  }

  let color: number[] = [];
  let lat: number[] = [];
  let lon: number[] = [];
  let text: string[] = [];
  let hovertext: string[] = [];
  let size: number[] = [];
  let nflights: number[] = [];

  $: color=fArr(stacks, 'maxScore');
  $: lat=fArr(stacks, 'origin_lat');
  $: lon=fArr(stacks, 'origin_lng');
  $: text=fArr(stacks, 'maxScore', v=>v.toFixed(2));
  $: hovertext=fArr(stacks, 'info');
  $: nflights=fArr(stacks, 'nFlights');
  $: if(nflights) size=fArr(stacks, 'nFlights', v=>7+20*v/Math.max(...nflights));

</script>

<Plot
	data={[
    {
      hoverinfo: 'text',
      type: 'scattermap',
      mode: 'markers+text',
      marker: { size, color, opacity: 1, colorscale: 'Bluered', },
      showlegend: false,
      textposition: 'bottom right',
			lat,
			lon,
			text,
      hovertext
		}
  ]}
	layout={{
		map: {
			bearing: 0,
			center: { lat: 0, lon: 0 },
			pitch: 0
		},
		margin: { l: 0, r: 0, t: 0, b: 0 }
	}}
	fillParent={true}
/>
