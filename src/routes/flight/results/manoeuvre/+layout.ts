import {goto} from '$app/navigation';
import {base} from '$app/paths';
import { get } from 'svelte/store';
import {  selManID } from '$lib/stores/analysis';

export async function load() {  
  if (get(selManID)==undefined) {
    console.debug('No manoeuvre selected');
    goto(base + '/flight/results');
  } 

}