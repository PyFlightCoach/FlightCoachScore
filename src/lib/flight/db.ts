// TODO This seems like a nicer way of doing things.
// finish populating and refactor to use these types more generally. 



export const privacyOptions = ['basic', 'view_flown', 'view_analysis'];
export type PrivacyOptions = (typeof privacyOptions)[number];
export const dbFlightPrivacy = {
	basic: 'basic',
	view: 'view_flown',
	analysis: 'view_analysis'
};



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
  datetime?: string | undefined;
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


