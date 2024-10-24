import { get } from 'svelte/store';
import { analyseManoeuvre } from '$lib/analysis/analysis';
import { selManID } from '$lib/stores/analysis';

export async function load() {
   let manid = get(selManID);
   await analyseManoeuvre(manid, false, false);
}