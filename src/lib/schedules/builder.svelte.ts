import { dbServer, analysisServer } from '$lib/api';
import { ManParm } from '$lib/schedules/mandef';
import { type Writable, writable, derived, type Readable } from 'svelte/store';
import * as types from '$lib/interfaces';
import { user } from '$lib/stores/user';
import { loadSchedules } from './library';
import * as mh from './manoeuvre_handler.svelte';


export const rules: Writable<string[]> = writable();

export function loadRules() {
	analysisServer
		.get('rules')
		.then((res) => rules.set(res.data))
		.catch((e) => {
			alert(`Error loading rules from analysis server ${e}`);
		});
}

export const schedule: Writable<sh.ScheduleHandler | undefined> = writable();

export const dbSchedule: Writable<types.DBSchedule | undefined> = writable();
export const mans: Writable<(mh.ManoeuvreHandler)[]> = writable([]);
export const lastSelectedScheduleID: Writable<string | undefined> = writable(undefined);
export const rule: Writable<string | undefined> = writable();

export class ElementBuilder {
	constructor(
		readonly args: string[],
		readonly kwargs: Record<string, string | number | boolean>
	) {}

	static parse(data: Record<string, unknown>) {
		return new ElementBuilder(
			data.args as string[],
			data.kwargs as Record<string, string | number | boolean>
		);
	}
}

export class ManBuilder {
	constructor(
		readonly rule: string,
		readonly parameters: Record<string, ManParm>,
		readonly element_builders: Record<string, ElementBuilder>
	) {}

	get comparisons() {
		const names = Object.keys(this.parameters).filter(
			(k) => this.parameters[k].criteria.kind == 'Comparison'
		);
		return Object.fromEntries(names.map((n) => [n, this.parameters[n]]));
	}

	get comparisonValues() {
		return Object.fromEntries(Object.entries(this.comparisons).map(([k, v]) => [k, v.defaul]));
	}

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

rule.subscribe((r) => {
	if (r) {
		console.log('loading manbuilder presets for', r);
		ManBuilder.load(r).then((mb) => builder.set(mb!));
	}
});

export const canIEdit: Readable<boolean> = derived([dbSchedule, user], ([$dbSchedule, $user]) => {
	if ($user?.is_superuser) return true;
	if ($user?.is_cd) {
		if (!$dbSchedule) return true;
		return $dbSchedule?.owner_id == $user?.id;
	}
	return false;
});

export const addEmptyManoeuvre = (short_name: string, start: types.BoxLocation) => {
	let count = 0;
	mans.update((_mans) => {
		for (const m of _mans) {
			if (m.info.short_name.startsWith(short_name)) {
				count += 1;
			}
		}

		_mans.push(ManoeuvreHandler.empty(`${short_name}_${count + 1}`, start));
		return _mans;
	});
};

export const deleteSchedule = (schedule_id: string) => {
	dbServer.delete(`schedule/${schedule_id}`);
	mans.set([]);
	dbSchedule.set(undefined);
	loadSchedules({ schedule_id });
};

//export const postCategory = async (category_name: string, rule_name: string) => {};

//export const postSchedule = async (schedule_name: string, category_name: name) => {};

