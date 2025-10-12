import { dbServer, analysisServer } from '$lib/api';
import { States, type IState } from '$lib/utils/state';
import { ManInfo } from './info.svelte';
import { Figure, FigOption } from './aresti.svelte';
import { ManDef, ManOpt } from './definition.svelte';
import { type IOlan, type ParseOlanResponse } from './olan';
import { type IManoeuvre, Manoeuvre } from './raw.svelte';
import { DBManoeuvre } from '$lib/schedule/db';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';
import { BoxLocation } from '$lib/manoeuvre/positioning.svelte';
import {faVersion} from '$lib/stores/shared';

export class ManHandler {
	aresti: Figure | undefined = $state();
	definition: ManDef | undefined = $state();
	manoeuvre: Manoeuvre | undefined = $state();
	template: States | undefined = $state();

	constructor(
		aresti: Figure | undefined = undefined,
		definition: ManDef | undefined = undefined,
		manoeuvre: Manoeuvre | undefined = undefined,
		template: States | undefined = undefined
	) {
		this.aresti = aresti;
		this.definition = definition;
		this.manoeuvre = manoeuvre;
		this.template = template;
	}

	static build(
		i: number,
		figure: Figure | FigOption | undefined,
		definition: ManDef | ManOpt,
		data: { manoeuvre: IManoeuvre; template: IState[] }[]
	) {
		return new ManHandler(
			figure ? figure.figures[i] : undefined,
			definition.options[i],
			Manoeuvre.parse(data[i].manoeuvre),
			States.parse(data[i].template)
		);
	}
}

export class ManoeuvreHandler {
	info: ManInfo = $state(new ManInfo());
	dbManoeuvre: DBManoeuvre | undefined = $state();
	olan: IOlan | undefined = $state();
	options: ManHandler[] = $state([]);
	activeOption: number = $state(0);

	constructor(
		info: ManInfo = new ManInfo(),
		dbManoeuvre: DBManoeuvre | undefined = undefined,
		olan: IOlan | undefined = undefined,
		options: ManHandler[] = [],
		activeOption: number = 0
	) {
		this.info = info;
		this.dbManoeuvre = dbManoeuvre;
		this.olan = olan;
		this.options = options;
		this.activeOption = activeOption;
	}

	get aresti() {
		return this.options[this.activeOption].aresti;
	}
	get definition() {
		return this.options[this.activeOption].definition;
	}
	get manoeuvre() {
		return this.options[this.activeOption].manoeuvre;
	}
	get template() {
		return this.options[this.activeOption].template;
	}

	get canPost() {
		return (
			!this.dbManoeuvre &&
			(get(user)?.is_cd || get(user)?.is_superuser) &&
			!this.options.some((o) => !o.aresti || !o.definition)
		);
	}

	get canPatch() {
		return (
			this.dbManoeuvre &&
			(get(user)?.is_cd || get(user)?.is_superuser) &&
			!this.options.some((o) => !o.aresti || !o.definition)
		);
	}

	static async build(
		info: ManInfo,
		figure: Figure | FigOption | undefined,
		definition: ManDef | ManOpt,
		dbManoeuvre: DBManoeuvre | undefined = undefined,
		olan: IOlan | undefined = undefined
	) {
		const res = await analysisServer
			.post('create_template', { mdef: definition.dump() })
			.then((res) => res.data);

		return new ManoeuvreHandler(
			info,
			dbManoeuvre,
			olan,
			definition.options.map((_: ManDef | ManOpt, i: number) =>
				ManHandler.build(i, figure, definition, res)
			)
		);
	}

	static async parseAresti(
		rule: string,
		info: ManInfo,
		figure: Figure | FigOption,
		dbManoeuvre: DBManoeuvre | undefined = undefined,
		olan: IOlan | undefined = undefined
	) {
		const definition: ManDef | ManOpt = await analysisServer
			.post('create_mdef', { rules: rule, figure: figure.dump(info) })
			.then((res) => ManDef.parse(res.data))
      .catch((e) => {
        console.error(`Error creating ${info.short_name} ManDef from figure:`, e);
        throw e;
      });

		Object.entries(figure.combinations).forEach(([k, v]) => {
			definition.setmp(k, v.active);
		});

		return ManoeuvreHandler.build(info, figure, definition, dbManoeuvre, olan);
	}

	static async parseDB(manoeuvre: DBManoeuvre) {
		const { info, figure } = await dbServer
			.get(`schedule/manoeuvre/aresti/${manoeuvre.id}`, {
				validateStatus: (status) => [200, 401].includes(status)
			})
			.then((res) => {
				return res.status == 200 ? Figure.parse(res.data) : { info: undefined, figure: undefined };
			});

		const definition = await dbServer
			.get(`schedule/manoeuvre/definition/${manoeuvre.id}`)
			.then((res) => ManDef.parse(res.data));
		return ManoeuvreHandler.build(
			info || definition.info,
			figure,
			definition,
			manoeuvre,
			undefined
		);
	}

  static async parseJSON(rules: string, data: Record<string, any>) {    
    const fig = Figure.parse(data);
    return await ManoeuvreHandler.parseAresti(
      rules,
      fig.info,
      fig.figure,
    );
  }

	static parseOlanResponse(olanRes: ParseOlanResponse) {
		const { info, figure } = Figure.parse(olanRes.aresti);
		return new ManoeuvreHandler(info, undefined, olanRes.olan, [
			new ManHandler(
				figure as Figure,
				ManDef.parse(olanRes.definition) as ManDef,
				Manoeuvre.parse(olanRes.manoeuvre),
				States.parse(olanRes.template)
			)
		]);
	}

	static async parseOlan(olan: string, rules: string) {
		return analysisServer
			.post('parse_olan', { olan, rules })
			.then((res) => ManoeuvreHandler.parseOlanResponse(res.data[0]));
	}

	static empty(name: string, start: BoxLocation | undefined = undefined) {
		return new ManoeuvreHandler(
			new ManInfo(name, name, undefined, undefined, start),
			undefined,
			undefined,
			[new ManHandler(new Figure([], {}, {}, false))]
		);
	}

	dumpAresti() {
		const aresti = this.options.map((o, i) =>
			o.aresti!.dump(this.info)//, i ? `${this.info.short_name}_option_${i}` : this.info.short_name)
		);
    return aresti.length == 1 ? aresti[0] : {figures: aresti};
	}

	dumpDefinition() {
		const definition = this.options.map((o, i) =>
			o.definition!.dump(this.info, i ? `${this.info.short_name}_option_${i}` : this.info.short_name)
		);
    return definition.length == 1 ? definition[0] : definition;
	}

	async post(schedule_id: string, index: number) {
		return await dbServer.post(`schedule/manoeuvre`, {
			schedule_id,
			version: get(faVersion),
			index,
			aresti: JSON.stringify(this.dumpAresti()),
			definition: JSON.stringify(this.dumpDefinition())
		});
	}

	async patch() {
		return await dbServer.patch(`schedule/manoeuvre/${this.dbManoeuvre!.id}`, {
			version: get(faVersion),
			aresti: JSON.stringify(this.dumpAresti()),
			definition: JSON.stringify(this.dumpDefinition())
		});
	}
}
