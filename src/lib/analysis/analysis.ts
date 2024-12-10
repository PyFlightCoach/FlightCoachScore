import {
	scores,
	analyses,
	manNames,
	running,
	runInfo,
	selManID,
	states,
	isCompFlight,
	bin,
	origin,
	selectedResult,
	difficulty,
	truncate,
	fa_versions,
	binData,
	bootTime,
	isComplete,
	fcj
} from '$lib/stores/analysis';
import { activeFlight, isAnalysisModified, dataSource } from '$lib/stores/shared';
import { MA } from '$lib/analysis/ma';
import { get, writable } from 'svelte/store';
import { analysisServer, faVersion } from '$lib/api';
import { States } from '$lib/analysis/state';
import { Splitting } from '$lib/analysis/splitting';
import { ManDef } from '$lib/analysis/mandef';
import { ScheduleInfo } from './fcjson';
import { loadManDef, safeGetLibrary } from '$lib/schedules';
import { dbServer } from '$lib/api';
import JSZip from 'jszip';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { Flight } from '$lib/database/flight';

export function checkComplete() {
	return get(manNames)?.length && analyses.every((a) => get(a) && get(a)?.history[get(faVersion)!]);
}

function setupAnalysisArrays(mnames: string[]) {
	manNames.set(mnames);
	scores.set(new Array(mnames.length).fill(0));
	running.set(new Array(mnames.length).fill(false));
	analyses.length = mnames.length;
	runInfo.length = mnames.length;
	mnames.forEach((_, i) => {
		runInfo[i] = writable();
		analyses[i] = writable();
	});
}

function setAnalysis(i: number, man: MA) {
	analyses[i].set(man);

	analyses[i].subscribe((ma: MA | undefined) => {
		scores.update((s) => {
			if (ma) {
				s![i] =
					ma.get_score(get(selectedResult)!, get(difficulty), get(truncate)).total *
					(ma.mdef?.info.k || ma.k!);
			} else {
				s![i] = 0;
			}
			return s;
		});

		fa_versions.update((v) => {
			return [...new Set([...v, ...Object.keys(ma?.history || [])])];
		});

		isComplete.set(checkComplete());
	});
}

export function clearAnalysis() {
	activeFlight.set(undefined);
	selManID.set(undefined);
	states.set(undefined);
	manNames.set(undefined);
	scores.set(undefined);
	selectedResult.set(undefined);
	fa_versions.set([]);
	binData.set(undefined);
	bootTime.set(undefined);
	origin.set(undefined);
	fcj.set(undefined);
	bin.set(undefined);
	analyses.length = 0;
	running.set([]);
	runInfo.length = 0;
	activeFlight.set(undefined);
	isAnalysisModified.set(undefined);
	dataSource.set(undefined);
}

export async function newAnalysis(sts: States, split: Splitting) {
	setupAnalysisArrays(split.manNames);

	isAnalysisModified.set(false);

	if (get(binData)) {
		origin.update((orgn) => {
			return Object.assign(orgn!, orgn!.noMove());
		});
	}

	let direction: string = 'Infer';
	if (get(isCompFlight)) {
		const ddef = split.directionDefinition();

		const heading = sts.data[split.mans[ddef.manid - 1].stop!].direction_str();
		if (ddef.direction == 'DOWNWIND') {
			direction = heading == 'RTOL' ? 'LTOR' : 'RTOL';
		} else if (ddef.direction == 'UPWIND') {
			direction = heading == 'RTOL' ? 'RTOL' : 'LTOR';
		} else {
			throw new Error(`Invalid direction definition ${ddef.direction}`);
		}
	}

	split.analysisMans.forEach(async (id: number, i: number) => {
		runInfo[i].set(`New Analysis Created At ${new Date().toLocaleTimeString()}`);
		setAnalysis(
			i,
			new MA(
				split.mans[id].name!,
				id,
				id > 0 ? sts.data[split.mans[id - 1].stop!].t : 0,
				sts.data[split.mans[id].stop!].t,
				new ScheduleInfo(split.mans[id].schedule!.category_name, split.mans[id].schedule_name),
				direction,
				get(fcj)?.manhistory(id) || {},
				split.mans[id].manoeuvre!.k, // todo get K
				get(binData)
					? undefined
					: new States(sts.data.slice(split.mans[id - 1].stop, split.mans[id].stop)),
				split.mans[id].mdef
			)
		);
	});
}

export async function createAnalysisExport(small: boolean = false) {
	return {
		origin: get(origin),
		isComp: get(isCompFlight),
		sourceBin: get(bin)?.name || undefined,
		sourceFCJ: get(fcj)?.name || undefined,
		bootTime: get(bootTime)?.toISOString() || undefined,
		mans: analyses.map((_ma) => (small ? get(_ma)!.shortExport() : get(_ma)!.longExport()))
	};
}

export async function exportAnalysis(small: boolean = false) {
	return new Blob([JSON.stringify(await createAnalysisExport(small), null, 2)], {
		type: 'application/json'
	});
}

export async function importAnalysis(data: Record<string, any>) {
	clearAnalysis();
	origin.set(data.origin);
	isCompFlight.set(data.isComp);
	bootTime.set(data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined);

	setupAnalysisArrays(data.mans.map((ma: MA) => ma.name));

	await safeGetLibrary().then((library) => {
		data.mans.forEach(async (ma: ManDef, i: number) => {
			runInfo[i].set(`Imported Analysis at ${new Date().toLocaleTimeString()}`);

			MA.parse(ma).then(async (res) => {
				if (res.mdef) {
					setAnalysis(i, res);
				} else {
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
							res.k,
							res.flown,
							await loadManDef(
								library.subset({
									category_name: res.schedule.category,
									schedule_name: res.schedule.name
								}).first!.manoeuvres[res.id - 1].id
							)
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
	analyses.forEach(async (ma, i) => {
		await analyseManoeuvre(i, force, optimise);
	});
}

export async function analyseManoeuvre(
	id: number,
	force: boolean = false,
	optimise: boolean | undefined = undefined
) {
	const ma = get(analyses[id]);

	const isReRun = Object.keys(ma!.history).includes(await analysisServer.get('fa_version'));

	if (optimise === undefined) {
		optimise = !isReRun;
	} //optimise if for new analysis version

	if ((!ma!.scores || optimise || force) && !get(running)[id]) {
		//if scores exist, only run if server version not in history

		runInfo[id].set(`Running analysis at ${new Date().toLocaleTimeString()}`);

		running.update((v) => {
			v[id] = true;
			return v;
		});

		await ma!.run(optimise).then((res) => {
			analyses[id].set(res);
			running.update((v) => {
				v[id] = false;
				return v;
			});
		});
	}
}
