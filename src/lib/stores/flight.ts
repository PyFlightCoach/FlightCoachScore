import {Flight} from '$lib/flight/flight';
import {type Writable, writable} from 'svelte/store';


export const flight: Writable<Flight | undefined> = writable(undefined);

