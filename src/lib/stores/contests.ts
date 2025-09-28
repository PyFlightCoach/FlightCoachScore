import { writable, type Writable } from 'svelte/store';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';
import { listComps } from '$lib/competitions/contests/contests';

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



export const myComps = writable<ContestManager[] | undefined>();
export const enteredComps = writable<ContestManager[] | undefined>();

export async function reloadDropDownComps() {
  return Promise.all([
    listComps("Mine", undefined).then((c) => myComps.set(c)),
    listComps("Entered", undefined).then((c) => enteredComps.set(c))
  ]);
};

