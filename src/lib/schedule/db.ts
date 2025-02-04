// Matches the /schedule/schedules endpoint
export interface IDBManoeuvre {
	id: string;
	index: number;
	k: number;
	name: string;
	short_name: string;
	version: string;
}

export class DBManoeuvre {
	constructor(
		readonly id: string,
		readonly index: number,
		readonly k: number,
		readonly name: string,
		readonly short_name: string,
		readonly version: string,
		readonly schedule_id: string,
		readonly rule_name: string
	) {}

	static parse(man: IDBManoeuvre, schedule_id: string, rule_name: string) {
		return new DBManoeuvre(
			man.id,
			man.index,
			man.k,
			man.name,
			man.short_name,
			man.version,
			schedule_id,
			rule_name
		);
	}

	dump() {
		return {
			id: this.id,
			index: this.index,
			k: this.k,
			name: this.name,
			short_name: this.short_name,
			version: this.version
		} as IDBManoeuvre;
	}
}

export interface IDBSchedule {
	schedule_id: string;
	schedule_name: string;
	owner_id: string;
	owner_name: string;
	category_id: string;
	category_name: string;
	rule_id: string;
	rule_name: string;
	num_flights: number;
	manoeuvres: IDBManoeuvre[];
}

export class DBSchedule {
	constructor(
		readonly schedule_id: string,
		readonly schedule_name: string,
		readonly owner_id: string,
		readonly owner_name: string,
		readonly category_id: string,
		readonly category_name: string,
		readonly rule_id: string,
		readonly rule_name: string,
		readonly num_flights: number,
		readonly manoeuvres: DBManoeuvre[]
	) {}

	static parse(schedule: IDBSchedule) {
		return new DBSchedule(
			schedule.schedule_id,
			schedule.schedule_name,
			schedule.owner_id,
			schedule.owner_name,
			schedule.category_id,
			schedule.category_name,
			schedule.rule_id,
			schedule.rule_name,
			schedule.num_flights,
			schedule.manoeuvres.map((m) => DBManoeuvre.parse(m, schedule.schedule_id, schedule.rule_name))
		);
	}
	dump() {
		return {
			schedule_id: this.schedule_id,
			schedule_name: this.schedule_name,
			owner_id: this.owner_id,
			owner_name: this.owner_name,
			category_id: this.category_id,
			category_name: this.category_name,
			rule_id: this.rule_id,
			rule_name: this.rule_name,
			num_flights: this.num_flights,
			manoeuvres: this.manoeuvres.map((m) => m.dump())
		};
	}

  repr() {  
    return `${this.category_name} ${this.schedule_name}`;
  }


}
