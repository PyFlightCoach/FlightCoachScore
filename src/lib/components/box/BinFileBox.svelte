<script lang="ts">
	import BinReader from '$lib/components/bin/BinReader.svelte';
	import { Origin } from '$lib/analysis/fcjson';
	import { GPS } from '$lib/analysis/geometry';
	import type { BinData } from '../bin';
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import { linspace, lookupMonotonic } from '$lib/utils/arrays';

	export let origin: Origin | undefined;

	let binData: BinData | undefined;
	
	let inputChannel: string = 'C6';

	const findPoints = (chan: string) => {
		const rcin = binData?.rcin;
		if (!rcin) return undefined;

    let t0: number | undefined = undefined;
		let t1: number | undefined = undefined;

		for (let i = 1; i < rcin.t.length; i++) {
			if (rcin[chan][i] < 1500 && rcin[chan][i - 1] > 1500) {
				if (!t0) {
					t0 = rcin.t[i];
				} else {
					t1 = rcin.t[i];
					break;
				}
			}
		}
		if (t0) {
			const ipilot = lookupMonotonic(t0!, binData!.pos.t, 'nearest');
			const gpsPilot = new GPS(
				binData!.pos.Lat[ipilot],
				binData!.pos.Lng[ipilot],
				binData!.pos.Alt[ipilot]
			);
			if (t1) {
				const icenter = lookupMonotonic(t1!, binData!.pos.t, 'nearest');
				const gpsCentre = new GPS(
					binData!.pos.Lat[icenter],
					binData!.pos.Lng[icenter],
					binData!.pos.Alt[icenter]
				);
				return Origin.from_centre(gpsPilot, gpsCentre);
			} else {
				return new Origin(gpsPilot.lat, gpsPilot.lon, gpsPilot.alt, 0);
			}
		} else {
			return undefined;
		}
	};

  $: origin = findPoints(inputChannel)
  
</script>

<BinReader
	messages={['POS', 'RCIN']}
  bind:binData
	on:loaded={(e) => {
    origin = findPoints(inputChannel) || origin
  }}
/>
<button
	class="btn btn-outline-secondary dropdown-toggle form-control-sm"
	type="button"
	data-bs-toggle="dropdown"
	aria-expanded="false"
>
	{inputChannel}
</button>
<ul class="dropdown-menu">
	{#each linspace(1, 12, 12) as chan}
		<li><ToggleButton bind:group={inputChannel} value="C{chan}">C{chan}</ToggleButton></li>
	{/each}
</ul>
