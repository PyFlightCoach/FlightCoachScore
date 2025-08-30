import { writable, type Writable } from 'svelte/store';
import { dbServer } from '$lib/api';
import {
	type CompThingCreateUpdate,
	type CompThingSummary
} from '$lib/competitions/compInterfaces';
import { faVersion } from '$lib/stores/shared';
import { get } from 'svelte/store';

export const activeComp: Writable<CompThingSummary> = writable({} as CompThingSummary);

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

export async function createEmptyComp(name: string) {
	return await dbServer
		.post('/competition', {
			name,
			fa_version: get(faVersion) as string
		} as CompThingCreateUpdate)
		.then((res) => {
			updateCDComps();
			return res.data as CompThingSummary;
		});
}

export async function createEmptyThing(name: string, parentID: string) {
	return await dbServer
		.post('/competition', {
			name,
			parent_id: parentID,
		} as CompThingCreateUpdate)
		.then((res) => {
			return res.data as CompThingSummary;
		});
}
