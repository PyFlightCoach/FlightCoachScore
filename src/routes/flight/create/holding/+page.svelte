<script lang="ts">
	import { checkDuplicate, newAnalysis } from '$lib/flight/analysis.js';
	import BinReader from '$lib/flight/bin/BinReader.svelte';
	import { States } from '$lib/utils/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Splitting, ManSplit } from '$lib/flight/splitting';
	import { lookupMonotonic } from '$lib/utils/arrays';
	import { activeFlight } from '$lib/stores/shared';
	import { FlightDataSource } from '$lib/flight/flight';
	import * as fcj from '$lib/flight/fcjson';
	import { importAnalysis } from '$lib/flight/analysis.js';
	import type { AJson } from '$lib/flight/ajson';
	import { cat } from '$lib/utils/files.js';
	import { md5 } from 'js-md5';
	import { get } from 'svelte/store';

	const { data } = $props();

	let percent: number | undefined = $state(undefined);
	let binfile = $state(data.bin);
</script>

<BinReader
	bind:bin={binfile}
	bind:percent
	onloaded={async (...parseddata) => {
		const [bin, binData, bootTime] = parseddata;

		cat(bin!)
			.then((fileData) => checkDuplicate(md5(fileData as ArrayBuffer)))
			.then(() => {
				const states = States.from_binData(
					Object.setPrototypeOf(data.origin, fcj.Origin.prototype),
					binData
				);

				const manSplits = [ManSplit.takeOff(lookupMonotonic(data.splits![0], states.t))];
				data
					.splits!.slice(1, data.splits!.length - 1)
					.forEach((m, i) =>
						manSplits.push(new ManSplit(data.schedule!.manoeuvres[i], lookupMonotonic(m, states.t)))
					);
				manSplits.push(ManSplit.landing(states.data.length));

				const splitting = new Splitting(manSplits);

				$activeFlight = new FlightDataSource(
					bin,
					'bin',
					undefined,
					bootTime,
					binData,
					Object.setPrototypeOf(data.origin, fcj.Origin.prototype),
					splitting,
					splitting.schedule,
					undefined,
					undefined,
					true
				);

				goto(resolve('/flight/results'));
			});
	}}
	showInput={false}
/>
