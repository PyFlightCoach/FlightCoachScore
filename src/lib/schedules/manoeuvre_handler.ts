import { FigOption, Figure } from './aresti';
import { dbServer, analysisServer } from '$lib/api';
import { ManDef, ManOpt } from '$lib/schedules/mandef';
import { BoxLocation, ManInfo } from '$lib/schedules/maninfo';
import { Manoeuvre } from '$lib/schedules/manoeuvre';
import { States } from '$lib/analysis/state';
import type { DBManoeuvre } from '../database/interfaces';

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
		const figure = Figure.parse(data.aresti as Figure);
		return new ManoeuvreHandler(
			figure.info,
			figure,
			data.olan as Record<string, unknown>,
			ManDef.parse(data.definition as Record<string, never>),
			Manoeuvre.parse(data.manoeuvre as Record<string, never>),
			States.parse(data.template as Record<string, never>)
		);
	}

	static async build(
		figure: Figure | FigOption | undefined,
		definition: ManDef | ManOpt,
		dbManoeuvre: DBManoeuvre | undefined = undefined,
		olan: Record<string, unknown> | undefined = undefined
	) {
		const res = await analysisServer
			.post('create_template', { mdef: definition })
			.then((res) => res.data);

		if (Array.isArray(figure)) {
			return new ManOptionHandler(
				figure.map(
					(a, i) =>
						new ManoeuvreHandler(
							figure?.info || definition.info,
							figure,
							olan,
							(definition as ManOpt).options[i],
							Manoeuvre.parse(res[i].manoeuvre),
							States.parse(res[i].template),
							dbManoeuvre
						)
				)
			);
		} else {
			return new ManoeuvreHandler(
				figure?.info || definition.info,
				figure,
				olan,
				definition,
				Manoeuvre.parse(res[0].manoeuvre),
				States.parse(res[0].template),
				dbManoeuvre
			);
		}
	}

	static async parseAresti(
		rules: string,
		figure: Figure | FigOption,
		dbManoeuvre: DBManoeuvre | undefined = undefined,
		olan: Record<string, unknown> | undefined = undefined
	) {
		const definition = await analysisServer
			.post('create_mdef', { rules, figure })
			.then((res) => ManDef.parse(res.data));

		return ManoeuvreHandler.build(figure, definition, dbManoeuvre, olan);
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

		return ManoeuvreHandler.build(aresti, definition, manoeuvre);
	}

	static empty(short_name: string, start: BoxLocation) {
		const info = new ManInfo(short_name, 0, short_name, undefined, start);
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
