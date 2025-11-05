<script lang="ts">
	import { checkDuplicate, newAnalysis } from '$lib/flight/analysis.js';
	import BinReader from '$lib/flight/bin/BinReader.svelte';
	import { States } from '$lib/utils/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as split from '$lib/flight/splitting';
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
				const states = States.from_xkf1(
					Object.setPrototypeOf(data.origin, fcj.Origin.prototype),
					binData.orgn,
					binData.xkf1
				);

				const manSplits = [split.takeOff(lookupMonotonic(data.splits![0], states.t))];
				data
					.splits!.slice(1, data.splits!.length - 1)
					.forEach((m, i) =>
						manSplits.push(
							split.build(
								data.schedule!.category_name,
								data.schedule!.schedule_name,
								data.schedule!.manoeuvres[i],
								lookupMonotonic(m, states.t)
							)
						)
					);
				manSplits.push(split.landing(states.data.length));

				new split.Splitting(manSplits).loadManDefs().then(async (splitting) => {
					activeFlight.set(
						new FlightDataSource(
							bin,
							'bin',
							undefined,
							bootTime,
							binData,
							Object.setPrototypeOf(data.origin, fcj.Origin.prototype),
							splitting
						)
					);
					newAnalysis($activeFlight!);
					goto(resolve('/flight/results'));
				});
			});
	}}
	showInput={false}
/>
