import { type FCJson, type FCJMan } from '$lib/flight/fcjson';
import { States } from '$lib/utils/state';
import { lookupMonotonic } from '$lib/utils/arrays';
import { loadManDef, library } from '$lib/schedule/library';
import { DBSchedule, type DBManoeuvre } from '$lib/schedule/db';
import { get } from 'svelte/store';
import { schedule_id } from '$lib/leaderboards/stores';
import type { ManDef, ManOpt } from '../manoeuvre/definition.svelte';
import type { AJson, AJMan } from './ajson';

export interface Split {
	category_name?: string | undefined;
	schedule_name?: string | undefined;
	manoeuvre?: DBManoeuvre | undefined;
	stop?: number | undefined;
	fixed?: boolean;
	alternate_name?: 'TakeOff' | 'Landing' | 'Break' | undefined;
	mdef?: ManDef | ManOpt | undefined;
}

export function equals(a: Split, b: Split) {
	return (
		a.category_name == b.category_name &&
		a.schedule_name == b.schedule_name &&
		a.manoeuvre?.id == b.manoeuvre?.id &&
		a.stop == b.stop &&
		a.alternate_name == b.alternate_name
	);
}

export function build(
	category_name: string | undefined = undefined,
	schedule_name: string | undefined = undefined,
	manoeuvre: DBManoeuvre | undefined = undefined,
	stop: number | undefined = undefined,
	fixed: boolean = false,
	alternate_name: 'TakeOff' | 'Landing' | 'Break' | undefined = undefined
) {
	return {
		category_name,
		schedule_name,
		manoeuvre,
		stop,
		fixed,
		alternate_name
	} as Split;
}

export function takeOff(stop: number | undefined = undefined) {
	return { fixed: true, stop, alternate_name: 'TakeOff' } as Split;
}
export function sequence_break(stop: number | undefined = undefined) {
	return { stop, alternate_name: 'Break' } as Split;
}
export function landing(stop: number | undefined = undefined) {
	return { stop, alternate_name: 'Landing' } as Split;
}

export function empty(stop: number | undefined = undefined) {
	return { stop } as Split;
}

export function schedule(split: Split) {
	return get(library).subset({
		category_name: split.category_name!,
		schedule_name: split.schedule_name!
	}).first;
}

export function addManDef(split: Split) {
	if (split.manoeuvre) {
		const mdef = loadManDef(split.manoeuvre!.id);
		return Object.assign({}, split, { mdef });
	} else {
		return split;
	}
}

export function next(last: Split, stop: number | undefined = undefined) {
	const msBase = empty(stop);

	if (get(schedule_id) && !last.manoeuvre) {
		const last_schedule = get(library).subset({ schedule_id: get(schedule_id) }).first;
		if (last_schedule) {
			msBase.category_name = last_schedule.category_name;
			msBase.schedule_name = last_schedule.schedule_name;
			msBase.manoeuvre = last_schedule.manoeuvres[0];
		}
	}

	switch (last.alternate_name) {
		case 'Break':
		case undefined:
			if ((last.category_name && last.schedule_name && last.manoeuvre) || last.alternate_name) {
				if (last.manoeuvre) {
					const mans = schedule(last).manoeuvres;

					if (last.manoeuvre.index < mans.length) {
						return {
							...last,
							...{
								manoeuvre: mans[last.manoeuvre!.index],
								stop
							}
						};
					} else {
						return landing(stop);
					}
				} else {
					return {
						...last,
						...{
							manoeuvre: undefined,
							stop
						}
					};
				}
			} else {
				throw new Error('Cannot make next manoeuvre without fully defining previous');
			}
		case 'Landing':
			throw new Error('Landing must be the last manoeuvre');
		case 'TakeOff':
			//case 'Break':
			return msBase;
	}
}

export function isComp(splits: Split[]) {
	if (splits.length < 3) {
		return;
	}
	if (
		splits[0].alternate_name != 'TakeOff' ||
		splits[splits.length - 1].alternate_name != 'Landing'
	) {
		return;
	}

	if (!splits[1].manoeuvre) {
		return;
	}

	const schedule = get(library).subset({
		category_name: splits[1].category_name,
		schedule_name: splits[1].schedule_name
	}).first;

	if (splits.length - 2 != schedule.manoeuvres.length) {
		return;
	}

	if (schedule.manoeuvres.some((m, i) => m.short_name != splits[i + 1].manoeuvre?.short_name)) {
		return;
	}
	return schedule;
}

export class Splitting {
	constructor(readonly mans: Split[]) {}

  get stops() {
    return this.mans.map(m=>m.stop).join(", ");
  }

	get length() {
		return this.mans.length;
	}

	get analysisMans() {
		const oMans: number[] = [];
		this.mans.forEach((man, i) => {
			if (man.manoeuvre) {
				oMans.push(i);
			}
		});
		return oMans;
	}

	directionDefinition() {
		let ddef;
		const imans = this.analysisMans;
		for (let i = 0; i < imans.length; i++) {
			if (this.mans[imans[i]].mdef!.info.start.direction != 'CROSS') {
				ddef = { direction: this.mans[imans[i]].mdef!.info.start.direction, manid: imans[i] };
				break;
			}
		}
		return ddef!;
	}

	get manNames() {
		return this.analysisMans.map((iman) => this.mans[iman].manoeuvre!.short_name);
	}

	get schedule(): DBSchedule | undefined {
		return isComp(this.mans);
	}

	sliceInfo(id: number, t: number[]) {
		const istart = id > 0 ? this.mans[id - 1].stop! : 0;
		const istop = this.mans[id].stop!;
		return { istart, tstart: t[istart], istop, tstop: t[istop] };
	}

	static async parseFCJ(fcj: FCJson, states: States) {
		return parseFCJMans(fcj, states)
			.then(loadManDefs)
			.then((splits) => new Splitting(splits));
	}

	static async parseAJson(ajson: AJson) {
		let lasti = 0;
		const ajmans = ajson.mans.map((ajman) => {

			lasti += ajman.flown.length-1;
			return build(
				ajman.schedule.category,
				ajman.schedule.name,
				get(library).subset({
					schedule_name: ajman.schedule.name,
					category_name: ajman.schedule.category
				}).first.manoeuvres[ajman.id - 1],
				lasti
			);
		});
		return new Splitting([takeOff(0), ...ajmans, landing(lasti)]).loadManDefs();
	}

	static default() {
		return new Splitting([takeOff()]);
	}

	async loadManDefs() {
		return new Splitting(await loadManDefs(this.mans));
	}

	static equals(a: Splitting | undefined, b: Splitting | undefined) {
		if (a === undefined || b === undefined) {
			return a === b;
		}
		if (a.length != b.length) {
			return false;
		}
		for (let i = 0; i < a.length; i++) {
			if (!equals(a.mans[i], b.mans[i])) {
				return false;
			}
		}
		return true;
	}
}

export async function parseFCJMans(fcj: FCJson, states: States) {
	const stTime = states.t;
	const sinfo = await fcj.sinfo.to_pfc();

	const schedule = get(library).subset({
		category_name: sinfo.category,
		schedule_name: sinfo.name
	}).first;

	return fcj.mans.map((man: FCJMan, i: number) => {
		const stStop = lookupMonotonic(fcj.data[man.stop].time / 1e6, stTime);
		switch (i) {
			case 0:
				return takeOff(stStop);
			case fcj.mans.length - 1:
				return landing(stTime.length);
			default:
				return build(
					schedule.category_name,
					schedule.schedule_name,
					schedule.manoeuvres[i - 1],
					stStop
				);
		}
	});
}

export async function loadManDefs(splits: Split[]): Promise<Split[]> {
	const oMans: Promise<Split>[] = [];

	for (const man of splits) {
		if (man.manoeuvre) {
			oMans.push(loadManDef(man.manoeuvre.id).then((md) => ({ ...man, mdef: md })));
		} else {
			oMans.push((async () => man)());
		}
	}
	return Promise.all(oMans);
}
