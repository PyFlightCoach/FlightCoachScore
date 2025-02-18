<script lang="ts">
	import { Origin } from '$lib/flight/fcjson';

	let { origin, onchange }: { origin: Origin; onchange: (newOrigin: Origin) => void } = $props();
</script>

<table class="table table-sm">
	<tbody>
		<tr>
			<td>Latitude (deg)</td>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					value={origin.lat}
					onchange={(e) => {
						onchange(
							new Origin(
								parseFloat((e.target as HTMLInputElement).value),
								origin.lng,
								origin.alt,
								origin.heading
							)
						);
					}}
					step="0.0001"
				/></td
			>
		</tr>
		<tr>
			<td>Longitude (deg)</td>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					value={origin.lng}
					onchange={(e) => {
						onchange(
							new Origin(
								origin.lat,
								parseFloat((e.target as HTMLInputElement).value),
								origin.alt,
								origin.heading
							)
						);
					}}
					step="0.0001"
				/></td
			>
		</tr>
		<tr>
			<td>Altitude ASL (m)</td>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					value={origin.alt}
					onchange={(e) => {
						onchange(
							new Origin(
								origin.lat,
								origin.lng,
								parseFloat((e.target as HTMLInputElement).value),
								origin.heading
							)
						);
					}}
					step="1"
				/></td
			>
		</tr>
		<tr>
			<td>Heading (deg)</td>
			<td class="p-0"
				><input
					class="form-control w-100"
					type="number"
					value={origin.heading}
					onchange={(e) => {
						onchange(
							new Origin(
								origin.lat,
								origin.lng,
								origin.alt,
								parseFloat((e.target as HTMLInputElement).value)
							)
						);
					}}
					step="1"
				/></td
			>
		</tr>
	</tbody>
</table>
