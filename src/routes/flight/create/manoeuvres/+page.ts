import { binData, origin, states, fcj } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { BinData } from '$lib/components/bin/bindata';
import { Origin } from '$lib/analysis/fcjson';
import { States } from '$lib/analysis/state';

export async function load({ fetch }) {
	if (get(binData) && get(origin)) {
		states.set(States.from_xkf1(get(origin)!, get(binData)!.orgn, get(binData)!.xkf1));
	} else if (!get(states) && get(fcj)) {
		states.set(States.from_fcj(get(fcj)!));
	} else if (!get(states)) {
		if (get(binData)) {
			goto(base + '/flight/create/origin');
		} else {
			goto(base + '/flight/create/data');
		}
	}

	return {
		states: get(states)
	};
}
