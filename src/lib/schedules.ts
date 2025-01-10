import { dbServer } from '$lib/api';
import { ManDef, ManOpt } from '$lib/analysis/mandef';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { type DBSchedule } from '$lib/database/interfaces';
import { Manoeuvre } from '$lib/analysis/manoeuvre';
import { States } from '$lib/analysis/state';


export function scheduleRepr(s :DBSchedule|undefined): string {
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
    return new ScheduleLibrary(this.schedules.filter(s => ids.includes(s.schedule_id)));
  }

	unique(key: string): string[] {
		return Array.from(new Set(this.schedules.map((s) => s[key as keyof DBSchedule] as string)));
	}

	subset(conditions: Record<string, string>): ScheduleLibrary {
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

export async function loadKnowns() {
  const lib = get(library);
  if (lib.subset({owner_name: 'Fcscore Admin'}).empty) {
    await lib.update({owner: 'admin@fcscore.org'}).then(
      newlib=>{library.set(newlib.sort(['rule_name', 'category_name', 'schedule_name']))}
    );
  } 
};

export async function loadManDef(manoeuvre_id: string): Promise<ManDef | ManOpt> {
	return dbServer.get(`schedule/manoeuvre/definition/${manoeuvre_id}`).then((r) => ManDef.parse(r.data));
}

export async function safeGetLibrary() {
  await loadKnowns();
  return get(library);
}

export class Olan {
  constructor(
    readonly draw: string[],
    readonly rawfig: string,
    readonly figure: Record<string, unknown>,
    readonly mdef: ManDef,
    readonly manoeuvre: Manoeuvre,
    readonly template: States,
  ) {}

  static parse(data: Record<string, unknown>) {
    return new Olan(
      data.draw as string[],
      data.rawfig as string,
      data.figure as Record<string, unknown>,
      ManDef.parse(data.mdef as Record<string, never>) as ManDef,
      Manoeuvre.parse(data.manoeuvre as Record<string, never>),
      States.parse(data.template as Record<string, never>)
    );
  }
}