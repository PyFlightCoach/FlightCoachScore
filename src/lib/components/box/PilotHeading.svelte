<script lang="ts">
	import { Origin } from "$lib/analysis/fcjson";

  export let origin: Origin = new Origin(0,0,0, 0);

</script>



<table class="table table-sm">
	<thead>
		<tr>
			<th>Point</th>
			<th>Latitude (deg)</th>
			<th>Longitude (deg)</th>
			<th>Altitude ASL (m)</th>
      <th>Heading (deg)</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Pilot</td>
			<td><input type="number" bind:value={origin.lat} step="0.0001"/></td>
			<td><input type="number" bind:value={origin.lng} step="0.0001"/></td>
			<td><input type="number" bind:value={origin.alt} step="1"/></td>
      <td><input type="number" bind:value={origin.heading} step="1"/></td>
		</tr>
	</tbody>
</table>
