<script lang="ts">
	import { Origin } from "$lib/analysis/fcjson";

  export let origin: Origin = new Origin(0,0,0, 0);

</script>

<table class="table table-sm">
	<tbody>
		<tr>
			<td>Latitude (deg)</td>
			<td class="p-0"><input class="form-control w-100" type="number" bind:value={origin.lat} step="0.0001"/></td>
    </tr>
    <tr>
      <td>Longitude (deg)</td>
			<td class="p-0"><input class="form-control w-100" type="number" bind:value={origin.lng} step="0.0001"/></td>
    </tr>
    <tr>
      <td>Altitude ASL (m)</td>
			<td class="p-0"><input class="form-control w-100" type="number" bind:value={origin.alt} step="1"/></td>
    </tr>
    <tr>
      <td>Heading (deg)</td>
      <td class="p-0"><input class="form-control w-100" type="number" bind:value={origin.heading} step="1"/></td>
		</tr>
	</tbody>
</table>
