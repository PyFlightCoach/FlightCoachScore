import { analysisServer, dbServer, faVersion } from '$lib/api';
import { ManoeuvreHandler } from '../manoeuvre/manoeuvre_handler.svelte';
import { DBSchedule } from './db';
import { type ParseOlanResponse } from '../manoeuvre/olan';
import { ManBuilder } from '$lib/manoeuvre/builder.svelte';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

export class ScheduleHandler {
	manoeuvres: ManoeuvreHandler[] = $state([]);
	dbSchedule?: DBSchedule | undefined = $state();
	constructor(
		readonly builder: ManBuilder,
		manoeuvres: ManoeuvreHandler[],
		dbSchedule?: DBSchedule
	) {
		this.manoeuvres = manoeuvres;
		this.dbSchedule = dbSchedule;
	}

	static async empty(rule: string) {
		return new ScheduleHandler(await ManBuilder.load(rule), []);
	}

	static async parseOlan(olan: string, rule: string) {
		return new ScheduleHandler(
			await ManBuilder.load(rule),
			await analysisServer.post('parse_olan', { olan, rules: rule }).then((res) =>
				res.data.map((data: ParseOlanResponse) => {
					return ManoeuvreHandler.parseOlanResponse(data);
				})
			)
		);
	}

	static async parseJSON(file: File) {
		const data = await file.text().then((text) => JSON.parse(text));
		const figs = data.figures.map((fig: Record<string, any>) => {
      return ManoeuvreHandler.parseJSON(data.rules, fig);
    })

    return new ScheduleHandler(
			await ManBuilder.load(data.rules),
			await Promise.all(figs)
		);
	}

	static async parseDB(dbSchedule: DBSchedule) {
		const new_mans = new Array(dbSchedule.manoeuvres.length);
		for (const manoeuvre of dbSchedule.manoeuvres) {
			new_mans[manoeuvre.index - 1] = ManoeuvreHandler.parseDB(manoeuvre);
		}
		const sh = new ScheduleHandler(
			await ManBuilder.load(dbSchedule.rule_name),
			await Promise.all(new_mans),
			dbSchedule
		);
		return sh;
	}

	async delete() {
		return dbServer.delete(`schedule/${this.dbSchedule!.schedule_id}`);
	}

	async post(name: string, category: string) {
		return await dbServer
			.post(
				'schedule/category',
				{ name: category, rule: this.builder.rule },
				{ validateStatus: (status) => [200, 409].includes(status) }
			)
			.then(() => dbServer.post(`schedule`, { name, category }))
			.then(
				async (res) =>
					await Promise.all(this.manoeuvres.map((man, i) => man.post(res.data.schedule_id, i + 1)))
			);
	}

	async patch() {
		const res = this.manoeuvres.map((man) => man.patch());
		return await Promise.all(res);
	}

	get canIEdit() {
		if (get(user)?.is_superuser) return true;
		if (get(user)?.is_cd) {
			if (!this.dbSchedule) return true;
			return this.dbSchedule?.owner_id == get(user)?.id;
		}
		if (!this.dbSchedule) return true;
		return false;
	}

	arestiJson(name: string | undefined) {
		return {
			name: name || this.dbSchedule?.schedule_name,
			rules: this.builder.rule,
			figures: this.manoeuvres.map((m) => m.dumpAresti())
		};
	}

	definitionJson(name: string | undefined, category: string | undefined) {
		return {
			name: name || this.dbSchedule!.schedule_name,
			category: category || this.dbSchedule!.category_name,
			fa_version: get(faVersion),
			mdefs: this.manoeuvres.map((m) => m.dumpDefinition())
		};
	}
}

export const getScale = (rule: string) => {
	switch (rule) {
		case 'f3a':
			return 1.2;
		case 'IMAC':
			return 1.6;
		case 'IAC':
			return 3.0;
		case 'IACGLIDER':
			return 2.0;
		default:
			return 1.0;
	}
};
