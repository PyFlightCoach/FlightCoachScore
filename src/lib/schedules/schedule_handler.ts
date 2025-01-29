import { analysisServer } from '$lib/api';
import * as mh from './manoeuvre_handler.svelte';
import * as types from '$lib/interfaces/';

export interface ScheduleHandler {
	manoeuvres: mh.ManoeuvreHandler[];
	dbSchedule?: types.DBSchedule | undefined;
}

export async function parseOlan(olan: string, rules: string) {
	return {
		manoeuvres: await analysisServer.post('parse_olan', { olan, rules }).then((res) =>
			res.data.map((data: types.ParseOlanResponse) => {
				return mh.parseOlanResponse(data);
			})
		)
	};
}

export async function parseDB(dbSchedule: types.DBSched) {
	const new_mans = new Array(dbSchedule.manoeuvres.length);
	for (const manoeuvre of dbSchedule.manoeuvres) {
		new_mans[manoeuvre.index - 1] = mh.parseDB(manoeuvre);
	}
	return { manoeuvres: await Promise.all(new_mans), dbSchedule: dbSchedule };
}

export async function post(schedule: ScheduleHandler) {

}

export async function patch(schedule: ScheduleHandler) {

}