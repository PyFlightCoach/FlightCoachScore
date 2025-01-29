// TODO This seems like a nicer way of doing things.
// finish populating and refactor to use these types more generally. 




export type Arg = number | string | (number | string)[] | boolean;

export interface PE {
  kind: string;
  args: Arg[];
  kwargs: Record<string, Arg>;
  centred: boolean;
}

export interface Fig {
  elements: (PE | number)[];
	ndmps: Record<string, number | number[][]>;
	relax_back: boolean;
};
export interface Figure extends Fig {
	info: ManInfo;
};

export interface FigOption {
  info: ManInfo;
  figures: Fig[];
}

export interface FigureOption {
  figures: Figure[]
}

export interface ParseOlanResponse {
	olan: Olan;
	aresti: Figure;
	definition: object;
	manoeuvre: object;
	template: Record<string, never>;
};

export const privacyOptions = ['basic', 'view_flown', 'view_analysis'];
export type PrivacyOptions = (typeof privacyOptions)[number];
export const dbFlightPrivacy = {
	basic: 'basic',
	view: 'view_flown',
	analysis: 'view_analysis'
};


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



export interface DBFlight {
  flight_id: string;
  pilot_id: string;
  contributor_id: string;
  schedule_id: string;
  privacy: PrivacyOptions;
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
  ooo: boolean;
  inc: boolean;
}


export interface DBFlightScore extends DBFlight {
	props: {
		difficulty: 1 | 2 | 3;
		truncate: boolean;
	};
	score: number;
	manoeuvre_scores: number[];
}


export interface DBFlightMeta extends DBFlight {
	scores: Record<string, DBFlightScore[]>;
}

export interface DBFlightHandler extends DBFlightScore{
	scores: Record<string, DBFlightScore[]>;
}

// Matches the /schedule/schedules endpoint
export interface DBManoeuvre {
	id: string;
	index: number;
	k: number;
	name: string;
	short_name: string;
	version: string;
}


export interface DBSch {
	schedule_id: string;
	schedule_name: string;
	owner_id: string;
	owner_name: string;
	category_id: string;
	category_name: string;
	rule_id: string;
	rule_name: string;
	num_flights: number;  
}

// Matches the /schedule/schedules endpoint
export interface DBSchedule extends DBSch {
	manoeuvres: DBManoeuvre[];
}

// these are more useful for the client as it links back to the schedule
export interface DBMan extends DBManoeuvre {
  schedule: DBSch;
}

export interface DBSched extends DBSch {
  manoeuvres: DBMan[];
}