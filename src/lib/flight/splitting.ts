import { type FCJson, type FCJMan } from '$lib/flight/fcjson';
import { States } from '$lib/utils/state';
import { lookupMonotonic } from '$lib/utils/arrays';
import { loadManDef, library } from '$lib/schedule/library';
import { DBSchedule, DBManoeuvre } from '$lib/schedule/db';
import { get } from 'svelte/store';
import { schedule_id } from '$lib/leaderboards/stores';
import type { ManDef, ManOpt } from '../manoeuvre/definition.svelte';
import type { AJson } from './ajson';

export class ManSplit {
	constructor(
		readonly manoeuvre: DBManoeuvre | 'TakeOff' | 'Landing' | 'Break' | undefined,
		readonly stop: number,
		readonly fixed: boolean = false,
		readonly mdef: ManDef | ManOpt | undefined = undefined
	) {}

	get schedule_id() {
		switch (this.manoeuvre) {
			case 'TakeOff':
				return get(schedule_id);
			case 'Landing':
			case 'Break':
				return undefined;
			default:
				return this.manoeuvre?.schedule_id || get(schedule_id);
		}
	}

	get schedule() {
		return get(library).subset({ schedule_id: this.schedule_id }).first;
	}

	get name() {
		return typeof this.manoeuvre == 'string' ? this.manoeuvre : this.manoeuvre?.short_name;
	}

	static equals(a: ManSplit, b: ManSplit, offset: number = 0) {
    // Offset applies to manoeuvre B, it accounts for the case where the states come from an ajson and there is no takeoff
		return a.manoeuvre == b.manoeuvre && a.stop == b.stop + offset;
	}

	static takeOff(stop: number) {
		return new ManSplit('TakeOff', stop, true);
	}
	static sequence_break(stop: number) {
		return new ManSplit('Break', stop);
	}
	static landing(stop: number) {
		return new ManSplit('Landing', stop);
	}

	async loadManDef() {
		if (this.manoeuvre && typeof this.manoeuvre != 'string') {
			return loadManDef(this.manoeuvre.id).then((mdef) => Object.assign(this, { mdef }));
		} else {
			return this;
		}
	}

	next(): DBManoeuvre | 'Landing' | undefined {
		if (this.schedule_id) {
			if (this.manoeuvre === 'TakeOff') {
				return this.schedule?.manoeuvres[0];
			} else if (typeof this.manoeuvre != 'string') {
				if (this.manoeuvre!.index < this.schedule.manoeuvres.length) {
					return this.schedule.manoeuvres[this.manoeuvre!.index];
				} else {
					return 'Landing';
				}
			}
		}
	}
}

export function isComp(splits: ManSplit[]) {
	if (splits.length < 3) {
		return;
	}
	if (splits[0].manoeuvre != 'TakeOff' || splits[splits.length - 1].manoeuvre != 'Landing') {
		return;
	}
	const schedule = get(library).subset({ schedule_id: splits[1].schedule_id }).first;
	if (
		schedule.manoeuvres.every((m, i) => {
			const sman = splits[i + 1].manoeuvre;
			return sman instanceof DBManoeuvre && sman.id == m.id;
		})
	) {
		return schedule;
	}
}

export class Splitting {
	constructor(readonly mans: ManSplit[]) {}

	get stops() {
		return this.mans.map((m) => m.stop).join(', ');
	}

	get length() {
		return this.mans.length;
	}

	get analysisMans() {
		const oMans: number[] = [];
		this.mans.forEach((man, i) => {
			if (man.manoeuvre instanceof DBManoeuvre) {
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
		return this.analysisMans.map((i) => this.mans[i].name);
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
			lasti += ajman.flown.length - 1;
			return new ManSplit(
				get(library).subset({
					schedule_name: ajman.schedule.name,
					category_name: ajman.schedule.category
				}).first.manoeuvres[ajman.id - 1],
				lasti
			);
		});
		return new Splitting([ManSplit.takeOff(0), ...ajmans, ManSplit.landing(lasti)]).loadManDefs();
	}

	static default() {
		return new Splitting([]);
	}

	async loadManDefs() {
		return new Splitting(await loadManDefs(this.mans));
	}

	static equals(a: Splitting | undefined, b: Splitting | undefined) {
		if (a === undefined || b === undefined) {
      console.log("Splitting.equals: one is undefined", a, b);
			return a === b;
		}
		if (a.length != b.length) {
      console.log("Splitting.equals: length mismatch", a.length, b.length);
			return false;
		}
		for (let i = 0; i < a.length; i++) {
			if (!ManSplit.equals(a.mans[i], b.mans[i])) {
        console.log("Splitting.equals: mans mismatch at index", i, a.mans[i], b.mans[i]);
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
				return ManSplit.takeOff(stStop);
			case fcj.mans.length - 1:
				return ManSplit.landing(stTime.length);
			default:
				return new ManSplit(schedule.manoeuvres[i - 1], stStop);
		}
	});
}

export async function loadManDefs(splits: ManSplit[]): Promise<ManSplit[]> {
	const oMans: Promise<ManSplit>[] = [];

	for (const man of splits) {
		if (man.manoeuvre instanceof DBManoeuvre) {
			oMans.push(loadManDef(man.manoeuvre.id).then((mdef) => Object.assign(man, { mdef })));
		} else {
			oMans.push((async () => man)());
		}
	}
	return Promise.all(oMans);
}
