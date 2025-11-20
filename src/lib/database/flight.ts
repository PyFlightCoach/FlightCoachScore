import type { DBSchedule } from '$lib/schedule/db';
import type { DBFlightMeta, DBFlightScore } from '$lib/api/DBInterfaces/flight';
import { dbServer } from '$lib/api/api';
import { library } from '$lib/schedule/library';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';
import { prettyPrintHttpError } from '$lib/utils/text';
import { dev } from '$lib/stores/shared';

export class DBFlight {
	constructor(
		readonly meta: DBFlightMeta,
		readonly schedule: DBSchedule
	) {}

	get isMine() {
		const userID = get(user)?.id.replaceAll('-', '');
		return this.meta.pilot_id === userID || this.meta.contributor_id === userID;
	}

	static async load(f: string | DBFlightMeta): Promise<DBFlight> {
    const meta = typeof f === "string" ? ( await dbServer.get(`flight/${f}`)).data as DBFlightMeta : f; 
		const schedule = get(library).subset({ schedule_id: meta.schedule_id }).only;
		return new DBFlight(meta, schedule);
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

export async function loadInPlotter(flight_id: string) {
	return await dbServer
		.post('flight/holding/copy/' + flight_id)
		.then((res) => {
			console.log('Flight copied to holding, expiry:', res.data.detail);
			//dev
			window.open(
				`https://flightcoach.org/fcviewer/plotter.html?token=${res.data.id}${get(dev) ? '&server=dev' : ''}`,
				'_blank'
			);
		})
		.catch((err) => {
			console.error(err);
			alert(prettyPrintHttpError(err));
		});
}
