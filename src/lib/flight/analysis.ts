import * as sts from '$lib/stores/analysis';
import { activeFlight, isAnalysisModified, loading, faVersion } from '$lib/stores/shared';
import { MA } from '$lib/manoeuvre/analysis';
import { get, writable } from 'svelte/store';
import { schedule as getScheduleFromSplit } from '$lib/flight/splitting';
import { ScheduleInfo } from './fcjson';
import { loadManDef, library } from '$lib/schedule/library';
import { dbServer } from '$lib/api/api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { cat } from '$lib/utils/files';
import { md5 } from 'js-md5';
import { prettyPrintHttpError } from '$lib/utils/text';
import { Flight } from './flight';
import type { AJson, AJMan } from './ajson';

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
	activeFlight.set(undefined);
	clearAnalysis();
}

export async function newAnalysis(flight: Flight) {
	const segmentation = flight.segmentation!;

	sts.schedule.set(segmentation.schedule);
	sts.isCompFlight.set(!!segmentation.schedule);
	setupAnalysisArrays(segmentation.manNames);

	isAnalysisModified.set(false);

	let direction: string;
	if (segmentation.schedule) {
		const ddef = segmentation.directionDefinition();

		const heading = flight.states!.data[segmentation.mans[ddef.manid - 1].stop!].direction_str();
		if (ddef.direction == 'DOWNWIND') {
			direction = heading == 'RTOL' ? 'LTOR' : 'RTOL';
		} else if (ddef.direction == 'UPWIND') {
			direction = heading == 'RTOL' ? 'RTOL' : 'LTOR';
		} else {
			throw new Error(`Invalid direction definition ${ddef.direction}`);
		}
	}

	segmentation.analysisMans.forEach(async (id: number, i: number) => {
		sts.runInfo[i].set(`New Analysis Created At ${new Date().toLocaleTimeString()}`);
		const sch = getScheduleFromSplit(segmentation.mans[id]);

		const { istart, tstart, istop, tstop } = flight.sliceInfo(id);
		const data = flight.slice(id);

		setAnalysis(
			i,
			new MA(
				segmentation.mans[id].manoeuvre!.short_name,
				id,
				tstart,
				tstop,
				new ScheduleInfo(sch.category_name, sch.schedule_name),
				direction,
				{},
				segmentation.mans[id].manoeuvre!.k,
				data,
				segmentation.mans[id].mdef
			)
		);
	});
}

export function createAnalysisExport(small: boolean = false) {
	return {
		origin: get(activeFlight)!.origin!,
		isComp: get(sts.isCompFlight),
		sourceBin: get(activeFlight)!.source.file?.name || undefined,
		sourceFCJ: undefined,
		bootTime: get(activeFlight)!.source.bootTime?.toISOString() || undefined,
		mans: sts.analyses.map((_ma) => (small ? get(_ma)!.shortExport() : get(_ma)!.longExport()))
	} as unknown as AJson;
}

export function exportAnalysis(small: boolean = false) {
	return new Blob([JSON.stringify(createAnalysisExport(small), null, 2)], {
		type: 'application/json'
	});
}

export async function importAnalysis(data: AJson) {
	sts.isCompFlight.set(data.isComp);

	setupAnalysisArrays(data.mans.map((m) => m.name));

	data.mans.forEach(async (ma: AJMan, i: number) => {
		sts.runInfo[i].set(`Imported Analysis at ${new Date().toLocaleTimeString()}`);
		MA.parse(ma).then(async (res) => {
			const mdef = res.mdef
				? res.mdef
				: await loadManDef(
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
		});
	});

	const schedule = get(sts.analyses[1])?.schedule;
	if (schedule) {
		sts.schedule.set(
			get(library).subset({
				category_name: schedule?.category,
				schedule_name: schedule?.name
			}).first
		);
	}
}

export async function loadExample() {
	return Flight.example().then((flight) => {
		clearAnalysis();
		clearDataLoading();
		activeFlight.set(flight);
		importAnalysis(flight.source.rawData as AJson);
	});
}

export async function loadAnalysisFromDB(flight_id: string) {
	if (flight_id == get(activeFlight)?.source.db?.meta.flight_id) {
		goto(resolve('/flight/results'));
		return; //already loaded
	}
	if (get(sts.manNames) && !confirm('Loading from DB will clear current analysis, continue?')) {
		return;
	}
	loading.set(true);
	return Flight.download(flight_id)
		.then((f) => {
			importAnalysis(f.source.rawData as AJson);
			activeFlight.set(f);
		})
		.then(() => {
			goto(resolve('/flight/results'));
		})
		.catch((err) => {
			alert(prettyPrintHttpError(err));
		})
		.finally(() => {
			loading.set(false);
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

export async function checkDuplicate(bin: File) {
	return cat(bin, 'readAsArrayBuffer')
		.then((buf) => dbServer.get(`flight/check_duplicate/${md5(buf as ArrayBuffer)}`))
		.then(() => undefined)
		.catch((err) => {
			if (err.status === 409) {
				return err.response.data.detail.id;
			} else {
				throw err;
			}
		});
}
