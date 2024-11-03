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
	manoeuvres,
	fcj
} from '$lib/stores/analysis';
import { MA } from '$lib/analysis/ma';
import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import { base } from '$app/paths';
import { analysisServer } from '$lib/api';
import { States } from '$lib/analysis/state';
import { ManSplit } from '$lib/analysis/splitting';

export function checkComplete() {
	if (!get(manNames) || !get(bin)) {
		return false;
	}
	if (!analyses.every((a) => get(a) && get(a)!.scores !== undefined)) {
		return false;
	}
	return true;
}

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
						(value.mdef?.info.k | value.k);
				} else {
					s[i] = 0;
				}
				return s;
			});

			fa_versions.update((v) => {
				return [...new Set([...v, ...Object.keys(value?.history || [])])];
			});

			isComplete.set(checkComplete());
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

export async function createAnalysis(sts: States, mans: ManSplit[]) {
	const analysisMans: number[] = [];

	mans.forEach((man, i) => {
		if (man.sinfo) {
			analysisMans.push(i);
		}
	});

	createAnalyses(analysisMans.map((i) => mans[i].name));

	if (get(binData)) {
		origin.update((orgn) => {
			return Object.assign(orgn!, orgn!.noMove());
		});
	}

	let direction: string = 'Infer';
	if (get(isCompFlight)) {
    let ddef;
    try {
      ddef = await mans[analysisMans[0]].sinfo!.direction_definition();
    } catch {
      ddef = {manid: 0, direction: 'UPWIND'};
    }
		

		const heading = sts.data[mans[ddef.manid].stop!].direction_str();
		if (ddef.direction == 'DOWNWIND') {
			direction = heading == 'RTOL' ? 'LTOR' : 'RTOL';
		} else if (ddef.direction == 'UPWIND') {
			direction = heading == 'RTOL' ? 'RTOL' : 'LTOR';
		} else {
			throw new Error(`Invalid direction definition ${ddef.direction}`);
		}
	}

	analysisMans.forEach((id, i) => {
		analyses[i].set(
			new MA(
				mans[id].name,
				i + 1,
				id > 0 ? sts.data[mans[id - 1].stop!].t : 0,
				sts.data[mans[id].stop!].t,
				mans[id].sinfo!,
				direction,
				get(fcj)?.manhistory(id) || {},
				get(manoeuvres)[mans[id].sinfo!.to_string()][mans[id].id! - 1].k,
				get(binData)
					? undefined
					: new States(sts.data.slice(id > 0 ? mans[id - 1].stop : 0, mans[id].stop))
			)
		);
	});
	//goto(base + '/flight/results');
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

	createAnalyses(data.mans.map((ma: MA) => ma.name));

	data.mans.forEach((ma, i) => {
		MA.parse(ma).then((res) => {
			analyses[i].set(res);
		});
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

export async function analyseAll(force: boolean = false) {
	analyses.forEach(async (ma, i) => {
		await analyseManoeuvre(i, force);
	});
}

export async function analyseManoeuvre(
	id: number,
  force: boolean = false,
	optimise: boolean | undefined = undefined,
) {
	const ma = get(analyses[id]);

	const isReRun = Object.keys(ma!.history).includes(await analysisServer.get('fa_version'));

	if (optimise === undefined) {
		optimise = !isReRun;
	} //optimise if for new analysis version

	if ((!ma!.scores || optimise || force) && !get(running[id])) {
		//if scores exist, only run if server version not in history

		runInfo[id].set(`Running analysis at ${new Date().toLocaleTimeString()}`);
		running[id].set(true);

		await ma!.run(optimise).then((res) => {
			analyses[id].set(res);
			running[id].set(false);
		});
	}
}
