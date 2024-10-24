import { get } from 'svelte/store';
import { analyseManoeuvre } from '$lib/analysis';
import { selManID } from '$lib/stores';

export async function load() {
   await analyseManoeuvre(get(selManID), false, false);
}