import { loading } from '$lib/stores/shared';
import { FigOption, Figure } from './aresti';
import { dbServer, analysisServer } from '$lib/api';
import { ManDef, ManOpt } from '$lib/schedules/mandef';
import { ManInfo } from '$lib/schedules/maninfo';
import { Manoeuvre } from '$lib/schedules/manoeuvre';
import { States } from '$lib/analysis/state';
import { type Writable, writable, derived, type Readable } from 'svelte/store';
import type { DBSchedule, DBManoeuvre } from '../database/interfaces';
import { user } from '$lib/stores/user';

export class ManoeuvreHandler {
	info: ManInfo;
	aresti: Figure | FigOption | undefined;
	olan: Record<string, unknown> | undefined;
	definition: ManDef | ManOpt | undefined;
	manoeuvre: Manoeuvre | undefined;
	template: States | undefined = undefined;
  dbManoeuvre: DBManoeuvre | undefined = undefined;
	constructor(
		info: ManInfo,
		aresti: Figure | FigOption | undefined = undefined,
		olan: Record<string, unknown> | undefined = undefined,
		definition: ManDef | ManOpt | undefined = undefined,
		manoeuvre: Manoeuvre | undefined = undefined,
		template: States | undefined = undefined,
    dbManoeuvre: DBManoeuvre | undefined = undefined
	) {
		this.info = info;
		this.aresti = aresti;
		this.olan = olan;
		this.definition = definition;
		this.manoeuvre = manoeuvre;
		this.template = template;
    this.dbManoeuvre = dbManoeuvre;
	}

	static parseOlan(data: Record<string, unknown>) {
		return new ManoeuvreHandler(
			(data.aresti as Figure).info as ManInfo,
			data.aresti as Figure,
			data.olan as Record<string, unknown>,
			ManDef.parse(data.definition as Record<string, never>),
			Manoeuvre.parse(data.manoeuvre as Record<string, never>),
			States.parse(data.template as Record<string, never>)
		);
	}

	static async parseDB(manoeuvre: DBManoeuvre) {
		const aresti = await dbServer
			.get(`schedule/manoeuvre/aresti/${manoeuvre.id}`)
			.then((res) => Figure.parse(res.data))
			.catch((e) => {
				console.error(e);
				return undefined;
			});

		const definition = await dbServer
			.get(`schedule/manoeuvre/definition/${manoeuvre.id}`)
			.then((res) => ManDef.parse(res.data));

		const res = await analysisServer
			.post('create_template', { mdef: definition })
			.then((res) => res.data);

		if (Array.isArray(aresti)) {
			return new ManOptionHandler(
				aresti.map(
					(a, i) =>
						new ManoeuvreHandler(
							aresti?.info || definition.info,
							aresti,
							undefined,
							(definition as ManOpt).options[i],
							Manoeuvre.parse(res[i].manoeuvre),
							States.parse(res[i].template),
              manoeuvre
						)
				)
			);
		} else {
			return new ManoeuvreHandler(
				aresti?.info || definition.info,
				aresti,
				undefined,
				definition,
				Manoeuvre.parse(res[0].manoeuvre),
				States.parse(res[0].template),
        manoeuvre
			);
		}
	}

	static empty(short_name: string) {
		const info = new ManInfo(short_name);
		return new ManoeuvreHandler(info, new Figure(info));
	}
}

export class ManOptionHandler {
	active: number = 0;
	constructor(readonly options: ManoeuvreHandler[]) {
		this.options = options;
	}
	get info() {
		return this.options[this.active].info;
	}
	get definition() {
		return this.options[this.active].definition;
	}
	get manoeuvre() {
		return this.options[this.active].manoeuvre;
	}
	get template() {
		return this.options[this.active].template;
	}
	get aresti() {
		return this.options[this.active].aresti;
	}
	get olan() {
		return this.options[this.active].olan;
	}
  get dbManoeuvre() {
    return this.options[this.active].dbManoeuvre;
  }
}

export class ScheduleBuilder {
	manoeuvres: (ManoeuvreHandler | ManOptionHandler)[] = [];
	schedule: DBSchedule | undefined = undefined;

	constructor(
		manoeuvres: (ManoeuvreHandler | ManOptionHandler)[] = [],
		schedule: DBSchedule | undefined = undefined
	) {
		this.manoeuvres = manoeuvres;
		this.schedule = schedule;
	}

	static async read_from_db(schedule: DBSchedule) {
		const manoeuvres = new Array(schedule.manoeuvres.length);
		for (const manoeuvre of schedule.manoeuvres) {
			manoeuvres[manoeuvre.index - 1] = ManoeuvreHandler.parseDB(manoeuvre);
		}
		return new ScheduleBuilder(await Promise.all(manoeuvres), schedule);
	}

	static async parseOlan(olan: string, rules: string) {
		const manoeuvres = await analysisServer
			.post('parse_olan', { olan, rules })
			.then((res) => res.data.map((v) => ManoeuvreHandler.parseOlan(v)))
			.catch((e) => {
				console.error(e);
			});
		return new ScheduleBuilder(manoeuvres);
	}
}

export const dbSchedule: Writable<DBSchedule | undefined> = writable();
export const mans: Writable<(ManoeuvreHandler | ManOptionHandler)[]> = writable([]);
export const lastSelectedScheduleID: Writable<string | undefined> = writable(undefined);
export const rule: Writable<string | undefined> = writable();

export const canIEdit: Readable<boolean> = derived([dbSchedule, user], ([$dbSchedule, $user]) => {
	if ($user?.is_superuser) return true;
	if ($user?.is_cd) {
		if (!$dbSchedule) return true;
		return $dbSchedule?.owner_id == $user?.id;
	}
	return false;
});

export const parseOlan = async (olan: string, rules: string) => {
	loading.set(true);
	mans.set(
		await analysisServer
			.post('parse_olan', { olan, rules })
			.then((res) => res.data.map((v) => ManoeuvreHandler.parseOlan(v)))
			.catch((e) => {
				console.error(e);
			})
			.finally(() => {
				loading.set(false);
			})
	);
};

export const parseDB = async (schedule: DBSchedule) => {
	loading.set(true);
	const new_mans = new Array(schedule.manoeuvres.length);
	dbSchedule.set(schedule);
	for (const manoeuvre of schedule.manoeuvres) {
		new_mans[manoeuvre.index - 1] = ManoeuvreHandler.parseDB(manoeuvre);
	}
	mans.set(await Promise.all(new_mans));
	loading.set(false);
};

export const addEmptyManoeuvre = (short_name: string) => {
  let count = 0;
  mans.update((_mans) => {
    for (const m of _mans) {
      if (m.info.short_name.startsWith(short_name)) {
        count+=1;
      }
    }
    
    _mans.push(ManoeuvreHandler.empty(`${short_name}_${count + 1}`));
    return _mans;
  });
}