import { selManID } from '$lib/stores/analysis';
import {goto} from '$app/navigation';
import {base} from '$app/paths';
import { get } from 'svelte/store';

export async function load() {  
  if (get(selManID)==undefined) {
    console.log('No manoeuvre selected');
    goto(base + '/flight/results');
  } 
}

