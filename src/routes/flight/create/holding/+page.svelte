<script lang="ts">
	import { binData, origin, fcj, bin, bootTime, states, manSplits } from '$lib/stores/analysis';
	import { newAnalysis } from '$lib/flight/analysis.js';
	import { dataSource, isFullSize } from '$lib/stores/shared';
	import BinReader from '$lib/flight/bin/BinReader.svelte';
	import { dbServer } from '$lib/api';
	import { split_states, States } from '$lib/utils/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as split from '$lib/flight/splitting';
	import { lookupMonotonic } from '$lib/utils/arrays';

	const { data } = $props();

	let percent: number | undefined = $state(undefined);
	let binfile = $state(data.bin);
</script>

<BinReader
	bind:bin={binfile}
	bind:percent
	onloaded={(...parseddata) => {
		let md5: string;
		[$bin, $binData, $bootTime, md5] = parseddata;
		dbServer
			.get(`flight/check_duplicate/${md5}`)
			.then((r) => {
				return r.statusText != 'OK';
			})
			.catch((e) => {
				return true;
			})
			.then((isDuplicate) => {
				if (isDuplicate) {
					$bin = undefined;
				}
			});
		$origin = data.origin;
		$states = States.from_xkf1($origin!, $binData!.orgn, $binData!.xkf1);
		const stTime = $states.t;

		$manSplits = [split.takeOff(lookupMonotonic(data.splits![0], stTime))];
		data.splits!
			.slice(1, data.splits!.length - 1)
			.forEach((m, i) =>
				$manSplits.push(
					split.build(
						data.schedule!.category_name,
						data.schedule!.schedule_name,
						data.schedule!.manoeuvres[i],
						lookupMonotonic(m, stTime)
					)
				)
			);
		$manSplits.push(split.landing($states.data.length));
		split.loadManDefs($manSplits).then((newSplits) => {
			$manSplits = newSplits;
			newAnalysis($states!, new split.Splitting($manSplits));
			goto(resolve('/flight/results'));
		});
	}}
	showInput={false}
/>
