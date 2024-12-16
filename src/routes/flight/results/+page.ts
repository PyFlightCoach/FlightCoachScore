import { manNames, bin } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { dev, dataSource } from '$lib/stores/shared';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { importAnalysis } from '$lib/analysis/analysis';

export async function load() {
	if (!get(manNames)) {
		if (get(dev) && confirm('no data loaded, load test data ?')) {
			console.debug('Loading example data');
			fetch(base + '/flight.ajson')
        .then(r=>r.json())
				.then(importAnalysis)
				.then(()=>fetch(base + '/flight.BIN'))
        .then(r=>r.blob())
        .then(r=>{
          bin.set(new File([r], 'flight.BIN'));
          dataSource.set('dev test');
        });
		} else {
			goto(base + '/flight/create/data');
		}
	}
}
