import type { DBSchedule} from '$lib/schedule/db';
import type { DBFlightMeta, DBFlightScore } from '$lib/flight/db';
import { dbServer } from '$lib/api/api';
import { library } from '$lib/schedule/library';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';



export class Flight {
	constructor(
		readonly meta: DBFlightMeta,
		readonly schedule: DBSchedule
	) {}

  get isMine() {
    return this.meta.pilot_id === get(user)?.id.replaceAll('-', '');
  }

	static async load(flight_id: string) {
		const meta = await dbServer.get(`flight/${flight_id}`);
		const schedule = get(library).subset({ schedule_id: meta.data.schedule_id }).only;
		return new Flight(meta.data, schedule);
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

  get date() {
    return new Date(this.meta.date);
  }

}
