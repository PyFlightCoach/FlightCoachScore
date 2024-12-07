import { manNames, bin } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { importAnalysis } from '$lib/analysis/analysis';

export async function load() {
	if (!get(manNames)) {
		if (dev && confirm('no data loaded, load test data ?')) {
			console.log('Loading example data');
			fetch(base + '/flight.ajson')
        .then(r=>r.json())
				.then(importAnalysis)
				.then(()=>fetch(base + '/flight.BIN'))
        .then(r=>r.blob())
        .then(r=>{bin.set(new File([r], 'flight.BIN'))});
		} else {
			goto(base + '/flight/create/data');
		}
	}
}
