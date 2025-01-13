import { analysisServer, dbServer } from '$lib/api';
import { BoxLocation, Heights, ManDef, ManInfo, ManOpt } from '$lib/analysis/mandef';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { type DBSchedule } from '$lib/database/interfaces';
import { Manoeuvre } from '$lib/analysis/manoeuvre';
import { States } from '$lib/analysis/state';
import { Figure } from '$lib/analysis/aresti';

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
	if (lib.subset({ owner_name: 'Fcscore Admin' }).empty) {
		await lib.update({ owner: 'admin@fcscore.org' }).then((newlib) => {
			library.set(newlib.sort(['rule_name', 'category_name', 'schedule_name']));
		});
	}
}

export async function loadManDef(manoeuvre_id: string): Promise<ManDef | ManOpt> {
	return dbServer
		.get(`schedule/manoeuvre/definition/${manoeuvre_id}`)
		.then((r) => ManDef.parse(r.data));
}

export async function safeGetLibrary() {
	await loadKnowns();
	return get(library);
}

export class ManoeuvreHandler {
	aresti: Figure;
	olan: Record<string, unknown> | undefined;
	definition: ManDef | ManOpt | undefined;
	manoeuvre: Manoeuvre | undefined;
	template: States | undefined = undefined;
	constructor(
		aresti: Figure,
		olan: Record<string, unknown> | undefined = undefined,
		definition: ManDef | ManOpt | undefined = undefined,
		manoeuvre: Manoeuvre | undefined = undefined,
		template: States | undefined = undefined
	) {
		this.aresti = aresti;
		this.olan = olan;
		this.definition = definition;
		this.manoeuvre = manoeuvre;
		this.template = template;
	}

	static parseOlan(data: Record<string, unknown>) {
		return new ManoeuvreHandler(
			data.aresti as Figure,
			data.olan as Record<string, unknown>,
			ManDef.parse(data.definition as Record<string, never>),
			Manoeuvre.parse(data.manoeuvre as Record<string, never>),
			States.parse(data.template as Record<string, never>)
		);
	}

	static async parseDB(manoeuvre_id: string) {
		const aresti = Figure.parse(
			(await dbServer.get(`schedule/manoeuvre/aresti/${manoeuvre_id}`)).data
		);
		const definition = ManDef.parse(
			(await dbServer.get(`schedule/manoeuvre/definition/${manoeuvre_id}`)).data
		);
		const res = (await analysisServer.post('create_template', { mdef: definition })).data;

		if (Array.isArray(aresti)) {
			return new ManOptionHandler(
				aresti.map(
					(a, i) =>
						new ManoeuvreHandler(
							a,
							undefined,
							(definition as ManOpt).options[i],
							Manoeuvre.parse(res[i].manoeuvre),
							States.parse(res[i].template)
						)
				)
			);
		} else {
			return new ManoeuvreHandler(
				aresti,
				undefined,
				definition,
				Manoeuvre.parse(res[0].manoeuvre),
				States.parse(res[0].template)
			);
		}
	}

	static empty(short_name: string) {
		return new ManoeuvreHandler(new Figure(new ManInfo(short_name)));
	}
}

export class ManOptionHandler {
	active: number = 0;
	constructor(readonly options: ManoeuvreHandler[]) {
		this.options = options;
	}
  get info() {return this.options[this.active].aresti.info;}
  get definition() {return this.options[this.active].definition;}
  get manoeuvre() {return this.options[this.active].manoeuvre;}
  get template() {return this.options[this.active].template;}
}
