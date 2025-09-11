import * as sts from '$lib/stores/analysis';
import {
	activeFlight,
	isAnalysisModified,
	dataSource,
	blockProgress,
	unblockProgress,
	loading,
  faVersion
} from '$lib/stores/shared';
import { MA } from '$lib/manoeuvre/analysis';
import { get, writable } from 'svelte/store';
import { analysisServer } from '$lib/api/api';
import { States } from '$lib/utils/state';
import { Splitting, schedule as getScheduleFromSplit } from '$lib/flight/splitting';
import { ManDef } from '$lib/manoeuvre/definition.svelte';
import { ScheduleInfo } from './fcjson';
import { loadManDef, library } from '$lib/schedule/library';
import { dbServer } from '$lib/api/api';
import JSZip from 'jszip';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { Flight } from '$lib/database/flight';
import { takeOff } from '$lib/flight/splitting';
import { Origin } from '$lib/flight/fcjson';

export function checkComplete() {
	return Boolean(
		get(sts.manNames)?.length &&
			sts.analyses.every((a) => get(a) && get(a)?.history[get(faVersion)!]?.results?.length)
	);
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
	console.log('clearing analysis');
	activeFlight.set(undefined);
	sts.selManID.set(undefined);
	sts.manNames.set(undefined);
	sts.scores.set(undefined);
	sts.selectedResult.set(undefined);
	sts.fa_versions.set([]);
	sts.analyses.length = 0;
	sts.running.set([]);
	sts.runInfo.length = 0;
	activeFlight.set(undefined);
	isAnalysisModified.set(undefined);
}

export function clearDataLoading() {
	console.log('clearing data loading');
	sts.states.set(undefined);
	sts.binData.set(undefined);
	sts.bootTime.set(undefined);
	sts.origin.set(Origin.load());
	sts.fcj.set(undefined);
	sts.bin.set(undefined);
	sts.manSplits.set([takeOff()]);
	dataSource.set(undefined);
	clearAnalysis();
}

export async function newAnalysis(states: States, split: Splitting) {
	setupAnalysisArrays(split.manNames);

	isAnalysisModified.set(false);

	if (get(sts.binData)) {
		sts.origin.update((orgn) => {
			return Object.assign(orgn!, orgn!.noMove());
		});
	}

	let direction: string;
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

export function createScoreCSV() {
  const fl = get(activeFlight);
  const sinfo = get(sts.analyses[1])?.schedule;
  const lines = [
    `#Category: ${sinfo!.category}`,
    `#Schedule: ${sinfo!.name}`,
    `#FAVersion: ${get(faVersion)}`,
    `#Boot Time: ${get(sts.bootTime)?.toISOString() || 'Unknown'}`,
    `#Pilot: ${fl?.meta.pilot_id || 'Unknown'}`,
    `#FCSCore ID: ${fl?.meta.flight_id || 'Unknown'}`,
    `#Dificulty: ${get(sts.difficulty)}`,
    `#Truncate: ${get(sts.truncate)}`,
    `#Total Score: ${get(sts.totalScore)}`,
    'ID,Manoeuvre,K,Score'
  ];

  sts.analyses.forEach((ma) => {
    const man = get(ma);
    const score = man?.get_score(get(sts.selectedResult)!, get(sts.difficulty), get(sts.truncate));
    lines.push(`${man?.id},${man?.name},${man?.k},${score?.total}`);
  });
  
  return new Blob([lines.join('\n')], {
    type: 'text/csv'
  });
}

export async function exportAnalysis(small: boolean = false) {
	return new Blob([JSON.stringify(await createAnalysisExport(small), null, 2)], {
		type: 'application/json'
	});
}

export async function importAnalysis(data: Record<string, any>) {
	clearDataLoading();
	sts.origin.set(data.origin);
	sts.isCompFlight.set(data.isComp);
	sts.bootTime.set(data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined);

	setupAnalysisArrays(data.mans.map((ma: MA) => ma.name));

	data.mans.forEach(async (ma: ManDef, i: number) => {
		sts.runInfo[i].set(`Imported Analysis at ${new Date().toLocaleTimeString()}`);

		MA.parse(ma).then(async (res) => {
			if (res.mdef) {
				setAnalysis(i, res);
			} else {
				const mdef = await loadManDef(
					get(library).subset({
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
}

export async function loadExample() {
	await analysisServer
		.get('example', blockProgress('Downloading Example'))
		.then((res) => {
			importAnalysis(res.data);
			dataSource.set('example');
		})
		.finally(unblockProgress);
}

export async function loadAJson(flight_id: string) {
  const zip = new JSZip();
	loading.set(true);
	return await dbServer
		.get(`flight/ajson/${flight_id}`, {
			responseType: 'blob',
			...blockProgress('Loading Analysis from Database')
		})
		.then((response) => zip.loadAsync(response.data))
		.then((res) => Object.values(res.files)[0].async('string'))
		.then((ajson) => JSON.parse(ajson))
    .finally(() => {
			unblockProgress();
			loading.set(false);
		});
}

export async function loadAnalysisFromDB(flight_id: string) {
  if (get(sts.manNames) || confirm('Loading from DB will clear current analysis, continue?') == false) {
    return;
  }
	loading.set(true);
	await loadAJson(flight_id)
		.then(importAnalysis)
		.then(() => Flight.load(flight_id))
		.then((flight) => {
			dataSource.set('db');
			activeFlight.set(flight);
			goto(`${base}/flight/results`);
		})
		.finally(() => {
			unblockProgress();
			loading.set(false);
		});
}

export async function loadAnalysisFromHolding(holdingId: string) {
  loading.set(true);
  await dbServer
    .get(`flight/holding/${holdingId}`)
    .then((response)=>{
      
    })

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
	sts.analyses.forEach((ma, i) => {
		analyseManoeuvre(i, force, optimise);
	});
}

export async function analyseManoeuvre(
	id: number,
	force: boolean = false,
	optimise: boolean | undefined = undefined,
  reset: boolean = false
) {
	const ma = get(sts.analyses[id]);

	const isReRun = Object.keys(ma!.history).includes(get(faVersion)!);

	if (optimise === undefined) {
		optimise = !isReRun;
	} //optimise if for new analysis version

	if ((!ma!.scores || optimise || force || reset) && !get(sts.running)[id]) {
		//if scores exist, only run if server version not in history

		sts.runInfo[id].set(`Running analysis at ${new Date().toLocaleTimeString()}`);

		sts.running.update((v) => {
			v[id] = true;
			return v;
		});

		await ma!
			.run(optimise, reset)
			.then((res) => {
				sts.analyses[id].set(res);
        sts.runInfo[id].set(res.runinfo);
			})
			.catch((e) => {
				console.error(e);
				sts.runInfo[id].set(`Analysis Failed: ${e.message}`);
			})
			.finally(() => {
				sts.running.update((v) => {
					v[id] = false;
					return v;
				});
			});

	}
}


export async function loadHoldingData(holdingId: string) {
 const fcj = dbServer.get(`flight/holding?holdingId=${holdingId}`)



}