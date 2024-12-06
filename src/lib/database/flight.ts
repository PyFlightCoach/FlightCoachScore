import type { DBFlightMeta, DBSchedule, DBFlightScore } from './interfaces';
import { dbServer } from '$lib/api';
import { library } from '$lib/schedules';
import { get } from 'svelte/store';



export class Flight {
	constructor(
		readonly meta: DBFlightMeta,
		readonly schedule: DBSchedule
	) {}

	static async load(flight_id: string) {
		const meta = await dbServer.get(`flight/${flight_id}`);
		const schedule = get(library).subset({ schedule_id: meta.schedule_id }).only;
		return new Flight(meta, schedule);
	}

	getScore(difficulty: number, truncate: boolean, version: string): DBFlightScore {
		const scores = this.meta.scores[version];
		const score = scores.find(
			(s) => s.props.difficulty === difficulty && s.props.truncate === truncate
		);
		if (!score) {
			throw 'Score not found';
		} else {
			return score;
		}
	}
}


