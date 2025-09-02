import { writable, type Writable } from 'svelte/store';
import { dbServer } from '$lib/api';
import { ContestManager } from '$lib/competitions/ContestManager';
import type { CompListRequest, CompThingSummary } from '$lib/competitions/compInterfaces';

export const activeComp: Writable<ContestManager> = writable();

export function setComp(comp: ContestManager) {
	activeComp.set(comp);
}

export const compList: Writable<ContestManager[]> = writable([]);

export const cdComps: Writable<ContestManager[]> = writable([]);
compList.subscribe((comps) => {
	cdComps.set(comps.filter((c) => c.isMyComp));
});

export async function listComps(params: CompListRequest) {
	return dbServer.get('/competition/list/', { params }).then((res) => {
		return res.data.results.map(
			(res: CompThingSummary) => new ContestManager(res)
		);
	});
}

export function setComps(competitions: ContestManager[]) {
	compList.set(competitions);
}

export async function getComps() {
  listComps({}).then(setComps).catch(err=>{console.log(err)});
}

export async function clearComps() {
  compList.set([]);
}