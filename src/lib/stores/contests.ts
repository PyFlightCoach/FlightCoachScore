import { writable, type Writable } from 'svelte/store';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';

export const activeComp: Writable<ContestManager | undefined> = writable();

export function setComp(comp: ContestManager | string | undefined) {
	if (typeof comp === 'string') {
		ContestManager.load(comp).then((c) => {
			activeComp.set(c);
		});
	} else {
		activeComp.set(comp);
	}
}
