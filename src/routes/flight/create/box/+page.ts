import { activeFlight } from '$lib/stores/shared';
import {goto} from '$app/navigation';
import { get } from 'svelte/store';
import {resolve} from '$app/paths';


export function load() {
  if (!get(activeFlight)) goto(resolve('/flight/create/bin'));

}