<script lang="ts">
	import { Origin } from '$lib/analysis/fcjson';
	import { GPS, Point } from '$lib/analysis/geometry';

	export let origin: Origin = new Origin(0,0,0, 0);
  export let kind: string = 'F3A';

  
	let centre = origin.pilot.offset(origin.rotation.transform_point(new Point(0, 100 ,0)));
	
  const updateOrigin = (newCentre: GPS) => {
    return Object.assign(origin, Origin.from_centre(origin.pilot, newCentre));
  }

  $: origin = updateOrigin(centre);
</script>


<table class="table table-sm">
	<thead>
		<tr>
			<th>Point</th>
			<th>Lat</th>
			<th>Lng</th>
			<th>Alt</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Pilot</td>
			<td><input type="number" bind:value={origin.lat} on:change={()=>{centre=centre}} step="0.0001"/></td>
			<td><input type="number" bind:value={origin.lng} on:change={()=>{centre=centre}} step="0.0001"/></td>
			<td><input type="number" bind:value={origin.alt} on:change={()=>{centre=centre}} step="1"/></td>
		</tr>
			<tr>
				<td>Center</td>
				<td><input type="number" bind:value={centre.lat} on:change={()=>{centre=centre}} step="0.0001"/></td>
				<td><input type="number" bind:value={centre.lon} on:change={()=>{centre=centre}} step="0.0001"/></td>
				<td><input type="number" bind:value={origin.alt} on:change={()=>{centre=centre}} step="1"/></td>
			</tr>
	</tbody>
</table>
