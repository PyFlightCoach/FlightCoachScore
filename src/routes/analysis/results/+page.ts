import { manNames } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { loadExample } from '$lib/analysis/analysis';

export async function load() {
	if (!get(manNames)) {
		if (dev) {
			console.log('Loading example data');
			loadExample();
		} else {
			goto(base + '/analysis/create/data');
		}
	}
}
