



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