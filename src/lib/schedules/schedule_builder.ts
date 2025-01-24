import { loading } from '$lib/stores/shared';
import { dbServer, analysisServer } from '$lib/api';
import { ManParm } from '$lib/schedules/mandef';
import { type Writable, writable, derived, type Readable } from 'svelte/store';
import type { DBSchedule } from '$lib/database/interfaces';
import { user } from '$lib/stores/user';
import { ScheduleLibrary, library, loadSchedulesforUser } from './library';
import { get } from 'svelte/store';
import { ManOptionHandler, ManoeuvreHandler } from './manoeuvre_handler';


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

export const rules: Writable<string[]> = writable();

export function loadRules() {
	analysisServer
		.get('rules')
		.then((res) => rules.set(res.data))
		.catch((e) => {
			alert(`Error loading rules from analysis server ${e}`);
		});
}

export const dbSchedule: Writable<DBSchedule | undefined> = writable();
export const mans: Writable<(ManoeuvreHandler | ManOptionHandler)[]> = writable([]);
export const lastSelectedScheduleID: Writable<string | undefined> = writable(undefined);
export const rule: Writable<string | undefined> = writable();

export class ElementBuilder {
	constructor(
		readonly args: string[],
		readonly kwargs: Record<string, string | number | boolean>
	) {}

  static parse(data: Record<string, unknown>) {
    return new ElementBuilder(data.args as string[], data.kwargs as Record<string, string | number | boolean>);
  }
}

export class ManBuilder {
	constructor(
		readonly rule: string,
		readonly parameters: Record<string, ManParm>,
		readonly element_builders: Record<string, ElementBuilder>
	) {}

	static async load(rule_name: string) {
		return analysisServer
			.get(`builder/${rule_name}`)
			.then((res) => {

				const parameters = Object.fromEntries(
					Object.entries(res.data.parameters).map(([k, v]) => [
						k,
						ManParm.parse(v as Record<string, never>)
					])
				);

        const element_builders = Object.fromEntries(
          Object.entries(res.data.element_builders).map(([k, v]) => [
            k,
            ElementBuilder.parse(v as Record<string, unknown>)
          ])
        );

        return new ManBuilder(rule_name, parameters, element_builders);

			})
			.catch((e) => {
				alert(`Error loading builder from analysis server ${e}`);
			});
	}
}

export const builder: Writable<ManBuilder | undefined> = writable();

rule.subscribe(r=>{
  
  if (r) {
    console.log('loading manbuilder presets for', r);
    ManBuilder.load(r).then(mb=>builder.set(mb!));
  };
});

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
				count += 1;
			}
		}

		_mans.push(ManoeuvreHandler.empty(`${short_name}_${count + 1}`));
		return _mans;
	});
};

export const deleteSchedule = (schedule_id: string) => {
	dbServer.delete(`schedule/${schedule_id}`);
	mans.set([]);
	dbSchedule.set(undefined);
	library.set(new ScheduleLibrary());
	loadSchedulesforUser('admin@fcscore.org');
	if (get(user)) loadSchedulesforUser(get(user)!.email);
};
