import { analysisServer } from '$lib/api/api';
import * as mh from '../manoeuvre/manoeuvre_handler.svelte';
import { DBSched, DBSchedule } from './db';
import { ParseOlanResponse } from './olan';

export interface ScheduleHandler {
	manoeuvres: mh.ManoeuvreHandler[];
	dbSchedule?: DBSchedule | undefined;
}

export async function parseOlan(olan: string, rules: string) {
	return {
		manoeuvres: await analysisServer.post('parse_olan', { olan, rules }).then((res) =>
			res.data.map((data: ParseOlanResponse) => {
				return mh.parseOlanResponse(data);
			})
		)
	};
}

export async function parseDB(dbSchedule: DBSched) {
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