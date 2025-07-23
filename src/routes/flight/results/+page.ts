import { manNames} from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { base } from '$app/paths';

export async function load() {
	if (!get(manNames)) goto(base + '/flight/create/data')
}
