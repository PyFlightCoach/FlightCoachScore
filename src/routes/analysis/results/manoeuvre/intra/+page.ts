import { get } from 'svelte/store';
import { analyseManoeuvre } from '$lib/analysis/analysis';
import { selManID } from '$lib/stores/analysis';

export async function load() {
   const manid = get(selManID);
   if (manid) {await analyseManoeuvre(manid, false, false)};
}