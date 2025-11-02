import {flight } from '$lib/stores/flight';
import {goto} from '$app/navigation';
import { get } from 'svelte/store';
import {resolve} from '$app/paths';


export function load() {
  if (!get(flight)) goto(resolve('/flight/create/bin'));

}