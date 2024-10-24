import { get } from 'svelte/store';
import { analyseManoeuvre } from '$lib/analysis';
import { selManID, analyses } from '$lib/stores';

export async function load() {
   let manid = get(selManID);
   await analyseManoeuvre(manid, false, false);
}