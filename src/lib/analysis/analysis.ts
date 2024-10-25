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
  bootTime
} from '$lib/stores/analysis';
import {MA} from '$lib/analysis/ma';
import { get } from 'svelte/store';
import { fcj } from '$lib/stores/analysis';
import { writable } from 'svelte/store';
import {base} from '$app/paths';
import {analysisServer} from '$lib/api';


export function createAnalyses(mnames: string[]) {
	manNames.set(mnames);
	scores.set(new Array(mnames.length).fill(0));

	mnames.forEach((name, i) => {
		analyses.push(writable());
		running.push(writable(false));
		runInfo.push(writable(`Empty Analysis Created At ${new Date().toLocaleTimeString()}`));

		analyses[i].subscribe((value) => {
			scores.update((s) => {
				if (value) {
					s[i] =
						value.get_score(get(selectedResult)!, get(difficulty), get(truncate)).total *
						(value?.mdef?.info?.k | value.k);
				} else {
					s[i] = 0;
				}
				return s;
			});

			fa_versions.update((v) => {
				return [...new Set([...v, ...Object.keys(value?.history || [])])];
			});
		});
	});
}

export function clearAnalysis() {
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
	running.length = 0;
	runInfo.length = 0;
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


export async function importAnalysis(data: Record<string, any>) {
	clearAnalysis();
	origin.set(data.origin);
	isCompFlight.set(data.isComp);
  bootTime.set( data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined);

	createAnalyses(data.mans.map((ma: MA) => ma.name));

	data.mans.forEach((ma, i) => {
		MA.parse(ma).then(res=>{analyses[i].set(res)});
	});



}

export async function loadExample() {
	clearAnalysis();
  importAnalysis(await (await fetch(`${base}/example/example_analysis.ajson`)).json());
	
}

export async function analyseMans(ids: number[]) {
	ids.forEach(async (id) => {
		await analyseManoeuvre(id);
	});
}

export async function analyseAll() {
	analyses.forEach(async (ma, i) => {   
    await analyseManoeuvre(i);
	});
}

export async function analyseManoeuvre(id: number, optimise: boolean | undefined = undefined) {
	const ma = get(analyses[id]);

  const isReRun = Object.keys(ma!.history).includes(await analysisServer.get('fa_version'));

  if (optimise === undefined) { optimise = !isReRun} //optimise if for new analysis version

  if ((! ma!.scores || optimise) && !get(running[id])) { 
    //if scores exist, only run if server version not in history

		runInfo[id].set(`Running analysis at ${new Date().toLocaleTimeString()}`);
		running[id].set(true);

		await ma!.run(optimise).then((res) => {
			analyses[id].set(res);
			running[id].set(false);
		});
  } 

	
}

