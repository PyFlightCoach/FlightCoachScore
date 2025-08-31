import { writable, type Writable } from 'svelte/store';
import { dbServer } from '$lib/api';
import { ContestManager } from '$lib/competitions/ContestManager';

export const activeComp: Writable<ContestManager> = writable();


export function setComp(comp: ContestManager) {
	activeComp.set(comp);
}

export const cdComps: Writable<Record<string, string>> = writable({});

export async function updateCDComps() {
	await dbServer
		.get('/competition/list/?i_am_cd=true')
		.then((res) => {
			cdComps.set(
				Object.fromEntries(res.data.results.map((c: Record<string, string>) => [c.name, c.id]))
			);
		})
		.catch((err) => {
			console.error('Error updating CD comps:', err);
			cdComps.set({});
		});
}

export async function clearCDComps() {
	cdComps.set({});
}

