import { dbServer } from '$lib/api/api';
import { ManDef, ManOpt } from '$lib/manoeuvre/definition.svelte';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { DBSchedule, type IDBSchedule } from '$lib/schedule/db';

import { user } from '$lib/stores/user';


export interface ScheduleRequest {
	schedule_id?: string;
	rule?: string;
	category?: string;
	owner?: string;
}

export async function requestSchedules(request: ScheduleRequest): Promise<DBSchedule[]> {
	const dbscheds = dbServer
		.get(`schedule/schedules`, request as Record<string, never>)
		.then((res) => res.data.results.map(DBSchedule.parse));
  return dbscheds;
}

export class ScheduleLibrary {
	constructor(readonly schedules: DBSchedule[] = []) {}

	get length(): number {
		return this.schedules.length;
	}
	get first(): DBSchedule {
		return this.schedules[0];
	}
	get only(): DBSchedule {
		if (this.schedules.length !== 1) {
			throw new Error(
				'ScheduleLibrary.only: ScheduleLibrary does not contain exactly one schedule'
			);
		}
		return this.schedules[0];
	}

	get empty(): boolean {
		return this.schedules.length === 0;
	}

	downselect(ids: string[]): ScheduleLibrary {
		return new ScheduleLibrary(this.schedules.filter((s) => ids.includes(s.schedule_id)));
	}

	unique(key: keyof DBSchedule): string[] {
		return Array.from(new Set(this.schedules.map((s) => s[key] as string)));
	}

	subset(conditions: Record<string, string | undefined>): ScheduleLibrary {
		const checkConditions = (s: DBSchedule) => {
			for (const key in conditions) {
				if (s[key as keyof IDBSchedule] !== conditions[key]) {
					return false;
				}
			}
			return true;
		};

		return new ScheduleLibrary(this.schedules.filter(checkConditions));
	}

	append(schedules: DBSchedule[]): ScheduleLibrary {
		const lib = new ScheduleLibrary(schedules.concat(this.schedules));
		const unique_ids = lib.unique('schedule_id');
		const newlib = new ScheduleLibrary(
			unique_ids.map((id: string) => lib.subset({ schedule_id: id }).first)
		);
    return newlib;
	}

	async update(request: ScheduleRequest): Promise<ScheduleLibrary> {
		const lib = this.append(await requestSchedules(request)).sort([
			'rule_name',
			'category_name',
			'schedule_name'
		]);
    return lib;
	}

	sort(keys: (keyof IDBSchedule)[]) {
		const sortFunction = (a: DBSchedule, b: DBSchedule) => {
			for (const key of keys) {
				if (a[key] < b[key]) {
					return -1;
				} else if (a[key] > b[key]) {
					return 1;
				}
			}
			return 0;
		};
		return new ScheduleLibrary(this.schedules.sort(sortFunction));
	}
}

export const library: Writable<ScheduleLibrary> = writable(new ScheduleLibrary());

export async function loadSchedules(request: ScheduleRequest) {
	console.log('loading schedules: ', request);
	get(library)
		.update(request)
		.then((newlib) => {
			library.set(newlib);
		})
		.catch((e) => {
			console.error('failed to load schedules', e);
			//alert('Failed to load schedules from DB, check your internet connection');
			library.set(new ScheduleLibrary());
		});
}

export async function reloadSchedules() {
	library.set(new ScheduleLibrary());
	await loadSchedules({ owner: 'admin@fcscore.org' });
	const _user = get(user);
	if (_user) await loadSchedules({ owner: _user.email });
}

export async function loadManDef(manoeuvre_id: string): Promise<ManDef | ManOpt> {
	return dbServer
		.get(`schedule/manoeuvre/definition/${manoeuvre_id}`)
		.then((r) => ManDef.parse(r.data));
}
