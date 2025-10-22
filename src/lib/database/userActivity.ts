import { dbServer } from '$lib/api/api';
import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';
import { library } from '$lib/schedule/library';
import { faVersion } from '$lib/stores/shared';
import { objSort } from '$lib/utils/arrays';
import { get } from 'svelte/store';

export interface UserActivityResponse {
	id: string;
	name: string;
	country: string;
	top_schedule_id: string;
	top_schedule_n: number;
	best_rank_schedule_id: string;
	best_rank: number;
	best_norm_rank_schedule_id: string;
	best_norm_rank: number;
	total_n: number;
}

export async function loadActivity() {
	return dbServer.get('analysis/user_activity').then((res) => {
		return res.data.results as UserActivityResponse[];
	});
}

export async function loadRecent(n_results = 20) {
	return dbServer.get('analysis/flightlist/', { params: {n_results} } ).then((res) => {
		return res.data.results as DBFlightRanked[];
	});
}

export async function loadScheduleFlights(schedule_id: string, n_results: number) {
	return dbServer
		.get('analysis/leaderboard/', {
			params: { schedule_id, n_results, version: get(faVersion), one_per_pilot_flag: true }
		})
		.then((res) => res.data.results as DBFlightRanked[]);
}

export async function loadTopFlights(n_results = 3) {

	const schedules = objSort(get(library).summarize(), (k, v) => -v.count);
  const flightLoads = [];
	for (const [schedule_id, sched] of Object.entries(schedules)) {
		flightLoads.push(loadScheduleFlights(schedule_id, n_results).then((flights) => {
      return {
      schedule: sched.repr,
			count: sched.count,
      flights: flights,
		};
    }));
	}

  return Promise.all(flightLoads);
}
