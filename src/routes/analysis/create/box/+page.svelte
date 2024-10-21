<script lang="ts">
	import { binData, origin } from '$lib/stores/analysis';
	import { Origin, FCJson } from '$lib/analysis/fcjson';
	import { GPS } from '$lib/analysis/geometry';
	import Plot from 'svelte-plotly.js';
	import { drawBoxInWorld, getPointOnCentre } from '$lib/analysis/box_geometry';

	let kind: string = 'F3A'; //TODO make this a cookie?
	let files: FileList;
	let norg: Origin = $binData
		? new Origin($binData!.POS.Lat[0], $binData!.POS.Lng[0], $binData!.POS.Alt[0], 0)
		: new Origin(0, 0, 0, 0);

	$: boxPoints = drawBoxInWorld(norg, kind);
	$: centre = getPointOnCentre(norg);

	const loadBoxFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const contents = reader.result as string;

			if (contents.startsWith('Emailed box data for F3A Zone Pro')) {
				const data = contents.split('\n');

				norg = Object.assign(
					norg,
					Origin.from_centre(
						new GPS(parseFloat(data[2]), parseFloat(data[3]), parseFloat(data[6])),
						new GPS(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]))
					)
				);
			} else {
				norg = Object.assign(norg, FCJson.parse(JSON.parse(contents)).origin);
			}
		};
		reader.readAsText(file);
	};
</script>

<div class="col-5">
	<div class="row pt-5">
    <div class="input-group-sm mb-3">
      <label class="form-control-sm text-nowrap">FC Json or f3a Zone file</label>
      <input class="form-control-sm" type="file" accept=".json, .f3a, '.F3A" bind:files />
      {#if files && files.length > 0}
        <button class="btn btn-outline-primary form-control-sm" on:click={() => {loadBoxFile(files[0])}}>
          Load
        </button>
      {/if}
    </div>
  </div>
  <div class="row pt-5">
    
    <div class="input-group-sm mb-3">

    </div>
  </div>
</div>
<div class="col-7">
	<Plot
		data={[
			{
				lat: $binData ? $binData?.POS?.Lat : [],
				lon: $binData ? $binData?.POS?.Lng : [],
				type: 'scattermap',
				mode: 'lines',
				hovermode: false,
				showlegend: false
			},
			{
				lat: [norg.lat],
				lon: [norg.lng],
				type: 'scattermap',
				mode: 'markers',
				showlegend: false,
				marker: {
					size: 10,
					color: 'red'
				}
			},
			{
				lat: [norg.lat, centre.lat],
				lon: [norg.lng, centre.lon],
				type: 'scattermap',
				mode: 'lines',
				showlegend: false,
				line: {
					color: 'black',
					dash: 'dot',
					width: 1
				}
			},
			{
				lat: boxPoints.map((point) => point.lat),
				lon: boxPoints.map((point) => point.lon),
				type: 'scattermap',
				mode: 'lines',
				showlegend: false,
				line: {
					color: 'black',
					width: 2
				}
			}
		]}
		layout={{
			map: {
				bearing: 0,
				center: {
					lat: $binData?.POS?.Lat[0] || norg.lat,
					lon: $binData?.POS?.Lng[0] || norg.lng
				},
				pitch: 0,
				zoom: 13,
				style: 'satellite'
			},
			margin: { l: 0, r: 0, t: 0, b: 0 }
		}}
		fillParent={true}
	/>
</div>
