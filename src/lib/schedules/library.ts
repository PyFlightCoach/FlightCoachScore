import { dbServer, dbServerAddress } from '$lib/api';
import { ManDef, ManOpt } from '$lib/schedules/mandef';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { type DBSchedule } from '$lib/database/interfaces';
import type { schedule_id } from '$lib/stores/leaderboards';

export function scheduleRepr(s: DBSchedule | undefined): string {
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

export async function loadSchedules(request: ScheduleRequest): Promise<DBSchedule[]> {
	const schedules = await dbServer.get(`schedule/schedules`, request as Record<string, never>);
	return schedules.data.results;
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

	unique(key: string): string[] {
		return Array.from(new Set(this.schedules.map((s) => s[key as keyof DBSchedule] as string)));
	}

	subset(conditions: Record<string, string | undefined>): ScheduleLibrary {
		const checkConditions = (s: DBSchedule) => {
			for (const key in conditions) {
				if (s[key as keyof DBSchedule] !== conditions[key]) {
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
		return new ScheduleLibrary(
			unique_ids.map((id: string) => lib.subset({ schedule_id: id }).first)
		);
	}

	async update(request: ScheduleRequest): Promise<ScheduleLibrary> {
		return this.append(await loadSchedules(request)).sort(['rule_name', 'category_name', 'schedule_name']);
	}

	sort(keys: string[]) {
		const sortFunction = (a: DBSchedule, b: DBSchedule) => {
			for (const key of keys) {
				if (a[key as keyof DBSchedule] < b[key as keyof DBSchedule]) {
					return -1;
				} else if (a[key as keyof DBSchedule] > b[key as keyof DBSchedule]) {
					return 1;
				}
			}
			return 0;
		};
		return new ScheduleLibrary(this.schedules.sort(sortFunction));
	}
}

export const library: Writable<ScheduleLibrary> = writable(new ScheduleLibrary());

export async function loadSchedulesforUser(owner: string) {
  console.log("loading schedules for ", owner)
  get(library).update({ owner: owner })
    .then(newlib => {library.set(newlib)})
    .catch(() => {
      alert("Failed to load schedules from DB, check your internet connection");
      library.set(new ScheduleLibrary());
    });
}


export async function loadManDef(manoeuvre_id: string): Promise<ManDef | ManOpt> {
	return dbServer
		.get(`schedule/manoeuvre/definition/${manoeuvre_id}`)
		.then((r) => ManDef.parse(r.data));
}
