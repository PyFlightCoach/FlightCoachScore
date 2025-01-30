import { dbServer, analysisServer } from '$lib/api/api';
import { type Writable, writable, derived, type Readable } from 'svelte/store';
import * as types from '$lib/flight/db';
import { user } from '$lib/stores/user';
import { loadSchedules } from './library';
import * as mh from '../manoeuvre/manoeuvre_handler.svelte';


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

