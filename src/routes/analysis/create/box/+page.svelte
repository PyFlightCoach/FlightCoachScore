<script lang="ts">
	import { binData, origin, fcj } from '$lib/stores/analysis';
	import { FCJson, Origin } from '$lib/analysis/fcjson';
	import { Point } from '$lib/analysis/geometry';
	import Plot from 'svelte-plotly.js';
	import { drawBoxInWorld, getPointOnCentre } from '$lib/analysis/box_geometry';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import pkg from 'file-saver';
	const { saveAs } = pkg;

	let kind: string = 'F3A'; //TODO make this a cookie?
	let files: FileList;
  let fcjson: FCJson | undefined;
	let norg: Origin = $origin
		? $origin
		: $binData
			? new Origin($binData!.pos.Lat[0], $binData!.pos.Lng[0], $binData!.pos.Alt[0], 0)
			: new Origin(0, 0, 0, 0);
  let loadMans: boolean = true;


	$: boxPoints = drawBoxInWorld(norg, kind);
	$: centre = getPointOnCentre(norg);

	const loadBoxFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
      const _norg = Origin.parseF3aZone(reader.result as string);
      if (_norg) {
        norg = Object.assign(norg, _norg);
        fcjson = undefined;
      } else {
        fcjson = FCJson.parse(JSON.parse(reader.result as string));
        if (fcjson) {
          norg = Object.assign(norg, fcjson.origin);
        }
      }
		};
		reader.readAsText(file);
	};

	const exportF3aZone = () => {
		centre = norg.pilot.offset(
			new Point(100 * Math.cos(norg.radHeading), 100 * Math.sin(norg.radHeading), 0)
		);

		const data = [
			"Emailed box data for F3A Zone Pro - please DON'T modify!",
			'1',
			norg.lat.toString(),
			norg.lng.toString(),
			centre.lat.toString(),
			centre.lon.toString(),
			norg.alt.toString()
		];

		const blob = new Blob([data.join('\n')], { type: 'text/plain;charset=utf-8' });
		saveAs(blob, 'f3a_zone.f3a');
	};
</script>

<div class="col-5">
	<div class="row pt-5">
		<div class="input-group-sm mb-3">
			<label class="form-control-sm text-nowrap">FC Json or f3a Zone file</label>
			<input class="form-control-sm" type="file" accept=".json, .f3a, '.F3A" bind:files />
			{#if files && files.length > 0}
				<button
					class="btn btn-outline-primary form-control-sm"
					on:click={() => {
						loadBoxFile(files[0]);
					}}
				>
					Load
				</button>
			{/if}
		</div>
	</div>
	<div class="row pt-5">
		<div class="input-group-sm mb-3">
			<button class="btn btn-outline-primary form-control-sm" on:click={exportF3aZone}>
				Save Box
			</button>
      {#if fcjson}
        <input type="checkbox" class="form-check-input mt-0 form-control-sm" id="loadMans" bind:checked={loadMans}/>
        <label class="form-control-sm" for="loadMans">Load manoeuvres from FCJ</label>
      {/if}

			<button
				class="btn btn-outline-primary form-control-sm"
				on:click={() => {
					$origin = norg;
          if (loadMans ) {fcj.set(fcjson)}
					goto(base + '/analysis/create/manoeuvres');
				}}
			>
				Next
			</button>
		</div>
	</div>
</div>
<div class="col-7">
	<Plot
		data={[
			{
				lat: $binData ? $binData?.pos.Lat : [],
				lon: $binData ? $binData?.pos.Lng : [],
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
					lat: $binData?.pos.Lat[0] || norg.lat,
					lon: $binData?.pos.Lng[0] || norg.lng
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
