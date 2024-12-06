

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


export const privacyOptions = ['basic', 'view_flown', 'view_analysis']

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

export interface DBFlightScore {
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
  analysis: 'view_analysis',
}

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
