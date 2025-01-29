import { dbServer, analysisServer } from '$lib/api';
import { States } from '$lib/analysis/state';
import * as types from '$lib/interfaces';
import { get } from 'svelte/store';
import { faVersion } from '$lib/api';

export interface ManoeuvreHandler {
	info: types.ManInfo;
	aresti: types.Fig[] | undefined;
	olan: types.Olan | undefined;
	definition: types.MD[] | undefined;
	manoeuvre: types.Manoeuvre[] | undefined;
	template: States[] | undefined;
	dbManoeuvre: types.DBMan | undefined;
}

export function canPost(mh: ManoeuvreHandler, user: types.DBUser) {
	return mh.aresti && mh.definition && !mh.dbManoeuvre && (user?.is_cd || user?.is_superuser);
}

export function canPatch(mh: ManoeuvreHandler, user: types.DBUser) {
	return mh.aresti && mh.definition && mh.dbManoeuvre && (user?.is_cd || user?.is_superuser);
}

export async function build(
	figure: types.Figure | types.FigureOption | undefined,
	definition: types.ManDef | types.ManOpt,
	dbManoeuvre: types.DBMan | undefined = undefined,
	olan: types.Olan | undefined = undefined
) {
	const res = await analysisServer
		.post('create_template', { mdef: definition })
		.then((res) => res.data);

	const _figure = figure ? (figure as types.FigureOption).figures || [figure] : undefined;
	const _definition = (definition as types.ManOpt).options || [definition];

	if (Array.isArray(figure)) {
		return figure.map((a, i) => ({
			info: _figure ? _figure[0].info : _definition[0].info,
			aresti: figure,
			olan,
			definition: _definition,
			manoeuvre: res.map((r) => r.manoeuvre),
			template: res.map((r) => States.parse(r.template)),
			dbManoeuvre
		}));
	}
}

export async function parseAresti(
	rule: string,
	figure: types.Figure | types.FigureOption,
	dbManoeuvre: types.DBMan | undefined = undefined,
	olan: types.Olan | undefined = undefined,
	comboDefaults: Record<string, number> = {}
) {
	const definition: types.ManDef = await analysisServer
		.post('create_mdef', { rules: rule, figure })
		.then((res) => res.data) ;

	Object.entries(comboDefaults).forEach(([k, v]) => {
		definition.mps[k].defaul = v;
	});

	return build(figure, definition, dbManoeuvre, olan);
}

export async function parseDB(manoeuvre: types.DBMan) {
	const aresti = dbServer
		.get(`schedule/manoeuvre/aresti/${manoeuvre.id}`)
		.then((res) => res.data as types.Figure | types.FigureOption)
		.catch((e) => {
			console.error(e);
			return undefined;
		});

	const definition = dbServer
		.get(`schedule/manoeuvre/definition/${manoeuvre.id}`)
		.then((res) => res.data as types.ManDef | types.ManOpt);

	return build(await Promise.resolve(aresti), await Promise.resolve(definition), manoeuvre);
}

export function parseOlanResponse(olanRes: types.ParseOlanResponse) {
	return {
		info: olanRes.aresti.info,
		aresti: [olanRes.aresti],
		olan: olanRes.olan,
		definition: [olanRes.definition],
		manoeuvre: [olanRes.manoeuvre],
		template: [States.parse(olanRes.template)]
	};
}

export async function parseOlan(olan: string, rules: string) {
	return analysisServer
		.post('parse_olan', { olan, rules })
		.then((res) => parseOlanResponse(res.data[0]));
}

export function empty(short_name: string, start: types.BoxLocation) {
	const info: types.ManInfo = { ...types.manInfo, short_name, start };
	return { info, aresti: { info, elements: [], ndmps: [], relax_back: false } };
}

export async function reload(
	dbMan: types.DBMan | undefined,
	olan: types.Olan | undefined,
	rules: string | undefined
) {
	if (dbMan) {
		return await parseDB(dbMan);
	} else if (olan) {
		return await parseOlan(olan.rawfig, rules || dbMan!.schedule.rule_name);
	} else {
		throw new Error('');
	}
}

export async function post(man: ManoeuvreHandler) {}

export async function patch(man: ManoeuvreHandler) {
	if (man.dbManoeuvre) {
		return await dbServer.patch(`schedule/manoeuvre/${man.dbManoeuvre.id}`, {
			version: get(faVersion),
			aresti: man.aresti,
			definition: man.definition
		});
	}
	return man;
}

export async function deleteMH(man: ManoeuvreHandler) {
	if (man.dbManoeuvre) {
		await dbServer.delete(`schedule/$mans[id]/${man.dbManoeuvre.id}`).then(() => {
			//TODO reload this scheudle
		});
	}
	return man;
}
