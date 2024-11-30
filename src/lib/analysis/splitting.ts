import { type FCJson, type FCJMan } from '$lib/analysis/fcjson';
import { States } from '$lib/analysis/state';
import { lookupMonotonic } from '$lib/utils/arrays';
import { ManDef, ManOpt } from './mandef';
import { dbServer } from '$lib/api';
import { library } from '$lib/schedules';
import { type Manoeuvre, type Schedule } from '$lib/schedules';

export class ManSplit {
	schedule: Schedule | undefined;
	manoeuvre: Manoeuvre | string;
	stop: number | undefined;
	fixed: boolean;
	constructor(
		schedule: Schedule | undefined,
		manoeuvre: Manoeuvre | string,
		stop: number | undefined = undefined,
    fixed: boolean = false
	) {
		this.schedule = schedule;
		this.manoeuvre = manoeuvre;
		this.stop = stop;
    this.fixed = fixed;
	}

	get name() {
		return typeof this.manoeuvre === 'string' ? this.manoeuvre : this.manoeuvre.short_name;
	}

	get mdef() {
		return dbServer
			.get(`schedule/manoeuvre/definition/${(this.manoeuvre as Manoeuvre).id}`)
			.then((r) => ManDef.parse(r));
	}

  get schedule_name() {
    return this.schedule?.schedule_name || '';
  }

	static TakeOff(stop: number | undefined = undefined) {
		return new ManSplit(undefined, 'TakeOff', stop, true);
	}
	static Break(stop: number | undefined = undefined) {
		return new ManSplit(undefined, 'Break', stop);
	}
	static Landing(stop: number | undefined = undefined) {
		return new ManSplit(undefined, 'Landing', stop);
	}

  static Empty(stop: number | undefined = undefined) {
    return new ManSplit(undefined, '', stop);
  }
}

export async function parseFCJMans(fcj: FCJson, states: States) {
	const stTime = states.t;
	const sinfo = await fcj.sinfo.to_pfc();
	const manDetails = await library[sinfo.category][sinfo.schedule];

	return fcj.mans.map((man: FCJMan, i: number) => {
		const stStop = lookupMonotonic(fcj.data[man.stop].time / 1e6, stTime);
		switch (i) {
			case 0:
				return new ManSplit('Takeoff', undefined, i, stStop);
			case fcj.mans.length - 1:
				return new ManSplit('Landing', undefined, i, stTime.length);
			default:
				return new ManSplit(manDetails[i - 1].name, manDetails[i - 1].sinfo, i, stStop);
		}
	});
}
