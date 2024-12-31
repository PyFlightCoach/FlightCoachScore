import { get } from 'svelte/store';
import { analyseManoeuvre } from '$lib/analysis/analysis';
import { selManID, analyses } from '$lib/stores/analysis';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export async function load() {
  
	await analyseManoeuvre(get(selManID)!, false).then(() => {
    const an = get(analyses[get(selManID) as number]);
		if (!an?.flown?.data[0].element) {
			alert('No Aligment information available, cannot edit');
			goto(base + '/flight/results/manoeuvre');
		}
	}).catch(() => {goto(base + '/flight/results')});


}
