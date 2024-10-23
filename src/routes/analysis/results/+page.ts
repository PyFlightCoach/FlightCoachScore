import { manNames, binData, origin } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { BinData } from '$lib/analysis/bindata';
import { Origin } from '$lib/analysis/fcjson';


export async function load({ fetch }) {
	if (true || !dev) {
		if (!get(manNames)) {
			goto(base + '/analysis/create/manoeuvres');
		}
	} else {
		if (!get(binData)) {
			console.log('Loading example data');
			binData.set(
				BinData.parse(await (await fetch(`${base}/example/example_bindata.json`)).json())
			);
		}
		if (!get(origin)) {
			origin.set(
				Origin.parseString(await (await fetch(`${base}/example/example_f3a_zone.f3a`)).text())
			);
		}
	}
}
