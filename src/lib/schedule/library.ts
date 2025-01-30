import { dbServer } from '$lib/api/api';
import { ManDef, ManOpt } from '$lib/manoeuvre/definition.svelte';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';
import type { DBSchedule, DBManoeuvre, DBSch, DBMan, DBSched } from '$lib/schedule/db';

import { user } from '$lib/stores/user';

export function scheduleRepr(s: DBSched | undefined): string {
	if (!s) {
		return 'Select Schedule';
	} else {
		return `${s.category_name} ${s.schedule_name}`;
	}
}

export interface ScheduleRequest {
	schedule_id?: string;
	rule?: string;
	category?: string;
	owner?: string;
}

export async function requestSchedules(request: ScheduleRequest): Promise<DBSched[]> {
	return dbServer.get(`schedule/schedules`, request as Record<string, never>).then((res) =>
		res.data.results.map((s: DBSchedule) => ({
			...s,
			manoeuvres: s.manoeuvres.map((m: DBManoeuvre) => ({ ...m, schedule: s } as DBMan))
		}))
	);
}

export class ScheduleLibrary {
	constructor(readonly schedules: DBSched[] = []) {}

	get length(): number {
		return this.schedules.length;
	}
	get first(): DBSched {
		return this.schedules[0];
	}
	get only(): DBSched {
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

	unique(key: keyof DBSch): string[] {
		return Array.from(new Set(this.schedules.map((s) => s[key] as string)));
	}

	subset(conditions: Record<string, string | undefined>): ScheduleLibrary {
		const checkConditions = (s: DBSchedule) => {
			for (const key in conditions) {
				if (s[key as keyof DBSch] !== conditions[key]) {
					return false;
				}
			}
			return true;
		};

		return new ScheduleLibrary(this.schedules.filter(checkConditions));
	}

	append(schedules: DBSched[]): ScheduleLibrary {
		const lib = new ScheduleLibrary(schedules.concat(this.schedules));
		const unique_ids = lib.unique('schedule_id');
		return new ScheduleLibrary(
			unique_ids.map((id: string) => lib.subset({ schedule_id: id }).first)
		);
	}

	async update(request: ScheduleRequest): Promise<ScheduleLibrary> {
		return this.append(await requestSchedules(request)).sort([
			'rule_name',
			'category_name',
			'schedule_name'
		]);
	}

	sort(keys: (keyof DBSch)[]) {
		const sortFunction = (a: DBSched, b: DBSched) => {
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
      console.error("failed to load schedules", e);
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
