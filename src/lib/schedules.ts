import { dbServer } from '$lib/api';
import { ManDef, ManOpt } from '$lib/analysis/mandef';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';

export interface Manoeuvre {
	id: string;
	index: number;
	k: number;
	name: string;
	short_name: string;
	version: string;
}

export interface Schedule {
	schedule_id: string;
	schedule_name: string;
	owner_id: string;
	owner_name: string;
	category_id: string;
	category_name: string;
	rule_id: string;
	rule_name: string;
	manoeuvres: Manoeuvre[];
	num_flights: number;
}

export function scheduleRepr(s :Schedule|undefined): string {
  if (!s) {
    return 'Select Schedule';
  } else {
    return `${s.category_name} - ${s.schedule_name}`;
  }
}

export interface ScheduleRequest {
  schedule_id?: string;
  rule?: string;
  category?: string;
  owner?: string;
}

export async function loadSchedules(request: ScheduleRequest): Promise<Schedule[]> {
	const schedules = await dbServer.get(`schedule/schedules`, request);
	return schedules.results;
}

export class ScheduleLibrary {
	constructor(readonly schedules: Schedule[] = []) {}

	get length(): number {
		return this.schedules.length;
	}
	get first(): Schedule {
		return this.schedules[0];
	}
	get only(): Schedule {
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

	unique(key: string): string[] {
		return Array.from(new Set(this.schedules.map((s) => s[key as keyof Schedule] as string)));
	}

	subset(conditions: Record<string, string>): ScheduleLibrary {
		const checkConditions = (s: Schedule) => {
			for (const key in conditions) {
				if (s[key as keyof Schedule] !== conditions[key]) {
					return false;
				}
			}
			return true;
		};

		return new ScheduleLibrary(this.schedules.filter(checkConditions));
	}

	append(schedules: Schedule[]): ScheduleLibrary {
		const lib = new ScheduleLibrary(this.schedules.concat(schedules));
		const unique_ids = lib.unique('schedule_id');
		return new ScheduleLibrary(
			unique_ids.map((id: string) => lib.subset({ schedule_id: id }).first)
		);
	}

	async update(request: ScheduleRequest): Promise<ScheduleLibrary> {
    return this.append(await loadSchedules(request));
	}

  sort(keys: string[]) {
    const sortFunction = (a: Schedule, b: Schedule) => {
      for (const key of keys) {
        if (a[key as keyof Schedule] < b[key as keyof Schedule]) {
          return -1;
        } else if (a[key as keyof Schedule] > b[key as keyof Schedule]) {
          return 1;
        }
      }
      return 0;
    };
    return new ScheduleLibrary(this.schedules.sort(sortFunction));
  }


}

export const library: Writable<ScheduleLibrary> = writable(new ScheduleLibrary());

export async function loadKnowns() {
  const lib = get(library);
  if (lib.subset({owner_name: 'Fcscore Admin'}).empty) {
    lib.update({owner: 'admin@fcscore.org'}).then(
      newlib=>{library.set(newlib.sort(['rule_name', 'category_name', 'schedule_name']))}
    );
  } 
};



export async function loadManDef(manoeuvre_id: string): Promise<ManDef | ManOpt> {
	return dbServer.get(`schedule/manoeuvre/definition/${manoeuvre_id}`).then((r) => ManDef.parse(r));
}
