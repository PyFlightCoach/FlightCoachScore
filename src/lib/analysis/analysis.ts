import * as sts from '$lib/stores/analysis';
import { activeFlight, isAnalysisModified, dataSource } from '$lib/stores/shared';
import { MA } from '$lib/analysis/ma';
import { get, writable } from 'svelte/store';
import { analysisServer, faVersion } from '$lib/api';
import { States } from '$lib/analysis/state';
import { Splitting, schedule as getScheduleFromSplit } from '$lib/analysis/splitting';
import { ManDef } from '$lib/analysis/mandef';
import { ScheduleInfo } from './fcjson';
import { loadManDef, safeGetLibrary } from '$lib/schedules';
import { dbServer } from '$lib/api';
import JSZip from 'jszip';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { Flight } from '$lib/database/flight';

export function checkComplete() {
	return Boolean(get(sts.manNames)?.length && sts.analyses.every((a) => get(a) && get(a)?.history[get(faVersion)!])) ;
}

function setupAnalysisArrays(mnames: string[]) {
	sts.manNames.set(mnames);
	sts.scores.set(new Array(mnames.length).fill(0));
	sts.running.set(new Array(mnames.length).fill(false));
	sts.analyses.length = mnames.length;
	sts.runInfo.length = mnames.length;
	mnames.forEach((_, i) => {
		sts.runInfo[i] = writable();
		sts.analyses[i] = writable();
	});
}

function setAnalysis(i: number, man: MA) {
	sts.analyses[i].set(man);

	sts.analyses[i].subscribe((ma: MA | undefined) => {
		sts.scores.update((s) => {
			if (ma) {
				s![i] =
					ma.get_score(get(sts.selectedResult)!, get(sts.difficulty), get(sts.truncate)).total *
					(ma.mdef?.info.k || ma.k!);
			} else {
				s![i] = 0;
			}
			return s;
		});

		sts.fa_versions.update((v) => {
			return [...new Set([...v, ...Object.keys(ma?.history || [])])];
		});

		sts.isComplete.set(checkComplete());
	});
}

export function clearAnalysis() {
	activeFlight.set(undefined);
	sts.selManID.set(undefined);
	sts.states.set(undefined);
	sts.manNames.set(undefined);
	sts.scores.set(undefined);
	sts.selectedResult.set(undefined);
	sts.fa_versions.set([]);
	sts.binData.set(undefined);
	sts.bootTime.set(undefined);
	sts.origin.set(undefined);
	sts.fcj.set(undefined);
	sts.bin.set(undefined);
	sts.analyses.length = 0;
	sts.running.set([]);
	sts.runInfo.length = 0;
	activeFlight.set(undefined);
	isAnalysisModified.set(undefined);
	dataSource.set(undefined);
}

export async function newAnalysis(states: States, split: Splitting) {
	setupAnalysisArrays(split.manNames);

	isAnalysisModified.set(false);

	if (get(sts.binData)) {
		sts.origin.update((orgn) => {
			return Object.assign(orgn!, orgn!.noMove());
		});
	}

	let direction: string = 'Infer';
	if (get(sts.isCompFlight)) {
		const ddef = split.directionDefinition();

		const heading = states.data[split.mans[ddef.manid - 1].stop!].direction_str();
		if (ddef.direction == 'DOWNWIND') {
			direction = heading == 'RTOL' ? 'LTOR' : 'RTOL';
		} else if (ddef.direction == 'UPWIND') {
			direction = heading == 'RTOL' ? 'RTOL' : 'LTOR';
		} else {
			throw new Error(`Invalid direction definition ${ddef.direction}`);
		}
	}

	split.analysisMans.forEach(async (id: number, i: number) => {
		sts.runInfo[i].set(`New Analysis Created At ${new Date().toLocaleTimeString()}`);
    const sch = getScheduleFromSplit(split.mans[id]);
		setAnalysis(
			i,
			new MA(
				split.mans[id].manoeuvre!.short_name,
				id,
				id > 0 ? states.data[split.mans[id - 1].stop!].t : 0,
				states.data[split.mans[id].stop!].t,
				new ScheduleInfo(sch.category_name, sch.schedule_name),
				direction,
				get(sts.fcj)?.manhistory(id) || {},
				split.mans[id].manoeuvre!.k, // todo get K
				get(sts.binData)
					? undefined
					: new States(states.data.slice(split.mans[id - 1].stop, split.mans[id].stop)),
				split.mans[id].mdef
			)
		);
	});
}

export async function createAnalysisExport(small: boolean = false) {
	return {
		origin: get(sts.origin),
		isComp: get(sts.isCompFlight),
		sourceBin: get(sts.bin)?.name || undefined,
		sourceFCJ: get(sts.fcj)?.name || undefined,
		bootTime: get(sts.bootTime)?.toISOString() || undefined,
		mans: sts.analyses.map((_ma) => (small ? get(_ma)!.shortExport() : get(_ma)!.longExport()))
	};
}

export async function exportAnalysis(small: boolean = false) {
	return new Blob([JSON.stringify(await createAnalysisExport(small), null, 2)], {
		type: 'application/json'
	});
}

export async function importAnalysis(data: Record<string, any>) {
	clearAnalysis();
	sts.origin.set(data.origin);
	sts.isCompFlight.set(data.isComp);
	sts.bootTime.set(data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined);

	setupAnalysisArrays(data.mans.map((ma: MA) => ma.name));

	await safeGetLibrary().then((library) => {
		data.mans.forEach(async (ma: ManDef, i: number) => {
			sts.runInfo[i].set(`Imported Analysis at ${new Date().toLocaleTimeString()}`);

			MA.parse(ma).then(async (res) => {
				if (res.mdef) {
					setAnalysis(i, res);
				} else {
          const mdef = await loadManDef(
            library.subset({
              category_name: res.schedule.category,
              schedule_name: res.schedule.name
            }).first!.manoeuvres[res.id - 1].id
          );
					setAnalysis(
						i,
						new MA(
							res.name,
							res.id,
							res.tStart,
							res.tStop,
							res.schedule,
							res.scheduleDirection,
							res.history,
							mdef.info.k,
							res.flown,
							mdef
						)
					);
				}
			});
		});
	});
}

export async function loadExample() {
	await analysisServer.get('example').then((res) => {
		importAnalysis(res);
    dataSource.set('example');
	});
}

export async function loadAnalysisFromDB(flight_id: string) {
	const zip = new JSZip();

	await dbServer
		.get(`flight/ajson/${flight_id}`, undefined, 'arrayBuffer')
		.then(response => zip.loadAsync(response))
		.then(res => Object.values(res.files)[0].async('string'))
		.then(ajson => JSON.parse(ajson))
		.then(importAnalysis)
		.then(() => Flight.load(flight_id))
		.then(flight => {
			dataSource.set('db');
      activeFlight.set(flight);
			goto(`${base}/flight/results`);
		});
}

export async function analyseMans(ids: number[]) {
	ids.forEach(async (id) => {
		await analyseManoeuvre(id);
	});
}

export async function analyseAll(
	force: boolean = false,
	optimise: boolean | undefined = undefined
) {
	sts.analyses.forEach(async (ma, i) => {
		await analyseManoeuvre(i, force, optimise);
	});
}

export async function analyseManoeuvre(
	id: number,
	force: boolean = false,
	optimise: boolean | undefined = undefined
) {
	const ma = get(sts.analyses[id]);

	const isReRun = Object.keys(ma!.history).includes(await analysisServer.get('fa_version'));

	if (optimise === undefined) {
		optimise = !isReRun;
	} //optimise if for new analysis version

	if ((!ma!.scores || optimise || force) && !get(sts.running)[id]) {
		//if scores exist, only run if server version not in history

		sts.runInfo[id].set(`Running analysis at ${new Date().toLocaleTimeString()}`);

		sts.running.update((v) => {
			v[id] = true;
			return v;
		});

		await ma!.run(optimise).then((res) => {
			sts.analyses[id].set(res);
			sts.running.update((v) => {
				v[id] = false;
				return v;
			});
		});
	}
}
