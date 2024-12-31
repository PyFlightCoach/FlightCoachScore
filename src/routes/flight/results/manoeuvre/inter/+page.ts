import { get } from 'svelte/store';
import { analyseManoeuvre } from '$lib/analysis/analysis';
import { selManID, analyses } from '$lib/stores/analysis';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export async function load() {

	await analyseManoeuvre(get(selManID)!, false).then(() => {
		if (!get(analyses[get(selManID) as number])?.scores) {
			alert('Analysis failed, cannot load results');
			goto(base + '/flight/results/manoeuvre');
		}
	}).catch(() => {goto(base + '/flight/results')});


}
