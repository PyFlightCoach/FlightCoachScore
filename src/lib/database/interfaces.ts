import { GPS } from '$lib/analysis/geometry';

export interface DBUser {
	id: string;
	email: string;
	is_active: boolean;
	is_superuser: boolean;
	is_verified: boolean;
	first_name: string;
	last_name: string;
	country: string;
	country_emoji: string;
	joined_when: string;
	is_cd: boolean;
	is_fake: boolean;
}

export const privacyOptions = ['basic', 'view_flown', 'view_analysis'];

export interface DBFlight {
	flight_id: string;
	pilot_id: string;
	contributor_id: string;
	schedule_id: string;
	privacy: 'basic' | 'view_flown' | 'view_analysis';
	origin_lat: number;
	origin_lng: number;
	name: string;
	country: string;
	date: string;
	comment: string;
}

export interface DBFlightRanked extends DBFlight {
	rank: number;
	table_rank: number;
	score: number;
	version: string[];
}


export class DBFlightStack {
	flights: DBFlightRanked[] = [];
	constructor(readonly loc: GPS) {}

	static build(flight: DBFlightRanked) {
		const dbf = new DBFlightStack(new GPS(flight.origin_lat, flight.origin_lng, 0));
		dbf.add(flight);
		return dbf;
	}

	checkAddFlight(flight: DBFlightRanked, tolerance: number) {
		if (GPS.sub(new GPS(flight.origin_lat, flight.origin_lng, 0), this.loc).length() < tolerance) {
			this.add(flight);
			return true;
		} else {
			return false;
		}
	}

	add(flight: DBFlightRanked) {
		this.flights.push(flight);
	}

  get info() {
    const best_pilot = this.bestFlight.name;
    return Object.entries({
      maxScore: this.maxScore,
      nFlights: this.nFlights,
      nPilots: this.pilots.length,
      pilots: '<br>' + this.pilots.map(v=>v==best_pilot ? `${best_pilot}*` : best_pilot ).join(', '),
    }).map(([k, v]) => `${k}: ${v}`).join('<br>');
  }

  get origin_lat() {
    return this.loc.lat;
  }
  get origin_lng() {
    return this.loc.lon;
  }

  get minScore() {
    return Math.min(...this.flights.map((f) => f.score));
  }
  get maxScore() {
    return Math.max(...this.flights.map((f) => f.score));
  }
  get bestFlight() {
    return this.flights.reduce((a, b) => (a.score > b.score ? a : b));
  }
  get worstFlight() {
    return this.flights.reduce((a, b) => (a.score < b.score ? a : b));
  }
  get avgScore() {
    return this.flights.reduce((a, b) => a.score + b.score, 0) / this.flights.length;
  }
  get nFlights() {
    return this.flights.length;
  }
  get pilots() {
    return Array.from(new Set(this.flights.map((f) => f.name)));
  }
}




export function stackFlights(trs: DBFlightRanked[], tolerance: number) {
	const stacks: DBFlightStack[] = [];
	trs.forEach((tr) => {
		let added = false;
		for (const st of stacks) {
			if (st.checkAddFlight(tr, tolerance)) {
				added = true;
				break;
			}
		}
		if (!added) {
			stacks.push(DBFlightStack.build(tr));
		}
	});
	return stacks;
}

export interface DBFlightScore extends DBFlight {
	props: {
		difficulty: 1 | 2 | 3;
		truncate: boolean;
	};
	score: number;
	manoeuvre_scores: number[];
}

export const dbFlightPrivacy = {
	basic: 'basic',
	view: 'view_flown',
	analysis: 'view_analysis'
};

export interface DBFlightMeta extends DBFlight {
	scores: Record<string, DBFlightScore[]>;
}

export class DBFlightHandler {
	constructor(
		readonly ranked: DBFlightRanked,
		readonly meta: DBFlightMeta | undefined = undefined
	) {}
}

export interface DBManoeuvre {
	id: string;
	index: number;
	k: number;
	name: string;
	short_name: string;
	version: string;
}

export interface DBSchedule {
	schedule_id: string;
	schedule_name: string;
	owner_id: string;
	owner_name: string;
	category_id: string;
	category_name: string;
	rule_id: string;
	rule_name: string;
	manoeuvres: DBManoeuvre[];
	num_flights: number;
}
