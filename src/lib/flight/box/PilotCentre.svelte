<script lang="ts">
	import { Origin } from '$lib/flight/fcjson';
	import { GPS, Point } from '$lib/utils/geometry';

	let { origin, onchange }: { origin: Origin; onchange: (newOrigin: Origin) => void } = $props();

	let pilot: { lat: number; lon: number; alt: number } = $state($state.snapshot(origin.pilot));
	let centre = $state($state.snapshot(origin.centre));

	$effect(() => {
		onchange(
			Origin.from_centre(
				new GPS(pilot.lat, pilot.lon, pilot.alt),
				new GPS(centre.lat, centre.lon, centre.alt)
			)
		);
	});
</script>

<table class="col table table-sm w-100">
	<thead>
		<tr>
			<th>Point</th>
			<th class="text-center">Pilot</th>
			<th class="text-center">Center</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Lat</td>
			<td class="p-0 text-center"
				><input class="form-control w-100" type="number" bind:value={pilot.lat} step="0.0001" /></td
			>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					bind:value={centre.lat}
					step="0.0001"
				/></td
			>
		</tr>
		<tr>
			<td>Lng</td>
			<td class="p-0"
				><input class="form-control w-100" type="number" bind:value={pilot.lon} step="0.0001" /></td
			>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					bind:value={centre.lon}
					step="0.0001"
				/></td
			>
		</tr>
		<tr>
			<td>Alt</td>
			<td class="p-0"
				><input class="form-control w-100" type="number" bind:value={pilot.alt} step="1" /></td
			>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					bind:value={pilot.alt}
					step="1"
					disabled
				/></td
			>
		</tr>
	</tbody>
</table>
