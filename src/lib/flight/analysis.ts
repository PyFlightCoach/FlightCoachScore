import * as sts from '$lib/stores/analysis';
import {
	activeFlight,
	isAnalysisModified,
	loading,
	faVersion,
	unblockProgress,
	blockProgress
} from '$lib/stores/shared';
import { MA } from '$lib/manoeuvre/analysis';
import { get, writable } from 'svelte/store';
import { schedule as getScheduleFromSplit, Splitting } from '$lib/flight/splitting';
import { Origin, ScheduleInfo } from './fcjson';
import { library } from '$lib/schedule/library';
import { analysisServer, dbServer } from '$lib/api/api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { prettyPrintHttpError } from '$lib/utils/text';
import { FlightDataSource } from './flight';
import type { AJson, AJMan } from './ajson';
import { States } from '$lib/utils/state';
import { checkUser } from '$lib/stores/user';

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
					ma.k;
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

export async function newAnalysis(flight: FlightDataSource) {
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

		const data = flight.slice(id);

		setAnalysis(
			i,
			new MA(
				segmentation.mans[id].manoeuvre!.short_name,
				id,
				new ScheduleInfo(sch.category_name, sch.schedule_name),
				direction,
				data,
				segmentation.mans[id].mdef,
        {},
			)
		);
	});
}

export function createAnalysisExport(small: boolean = false) {
	return {
		origin: get(activeFlight)!.origin!,
		isComp: get(sts.isCompFlight),
		sourceBin: get(activeFlight)!.file?.name || undefined,
		sourceFCJ: undefined,
		bootTime: get(activeFlight)!.bootTime?.toISOString() || undefined,
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
	const origin = Object.setPrototypeOf(data.origin, Origin.prototype);
	setupAnalysisArrays(data.mans.map((m) => m.name));

	data.mans.forEach(async (ma: AJMan, i: number) => {
		sts.runInfo[i].set(`Imported Analysis at ${new Date().toLocaleTimeString()}`);

		MA.parse(ma, origin).then(async (res) => {
			setAnalysis(i, res);
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
	return FlightDataSource.example().then((flight) => {
		clearAnalysis();
		clearDataLoading();
		activeFlight.set(flight);
		importAnalysis(flight.rawData as AJson);
	});
}

export async function loadAnalysisFromDB(flight_id: string) {
	if (flight_id == get(activeFlight)?.db?.flight_id) {
		goto(resolve('/flight/results'));
		return; //already loaded
	}
	if (get(sts.manNames) && !confirm('Loading from DB will clear current analysis, continue?')) {
		return;
	}
	loading.set(true);
	return FlightDataSource.db(flight_id)
		.then((f) => {
			importAnalysis(f.rawData as AJson);
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

export async function loadAcrowrx(file: File): Promise<void> {
	const fd = new FormData();
	fd.append('acrowrx_file', file);
	await analysisServer
		.post('/read_acrowrx', fd, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			...blockProgress(`Reading Acrowrx File`)
		})
		.then(async (response) => {
			await checkDuplicate(response.data.meta.flightFileName.split('/')[1]);
			return response;
		})
		.then((response) => {
			activeFlight.set(
				new FlightDataSource(
					file,
					'acrowrx',
					undefined,
					new Date(Date.parse(response.data.boot_time)),
					States.parse(response.data.data),
					Object.setPrototypeOf(response.data.origin, Origin.prototype),
					Splitting.default(),
					response.data.meta
				)
			);
		})
		.catch((e) => {
			alert(prettyPrintHttpError(e));
			goto(resolve('/'));
			throw e;
		})
		.finally(unblockProgress);
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

export async function checkDuplicate(md5: string, onload: () => void = ()=>{}) {
	//await cat(bin, 'readAsArrayBuffer').then(md5);
	return dbServer
		.get(`flight/check_duplicate/${md5}`)
		.then((res) => {
			console.log(res);
			return undefined;
		})
		.catch((err) => {
			console.log(err);
			if (err.status === 409) {
				const id = err.response.data.detail.split('id[')[1].split(']')[0];
				return id;
			} else {
				alert('Error checking duplicate: ' + prettyPrintHttpError(err));
			}
		})
		.then(async (duplicate: string | undefined) => {
			if (duplicate && confirm('BIN file already exists on server, do you want to load it?')) {
				return checkUser().then(() =>
					FlightDataSource.db(duplicate).then((fl) => {
						activeFlight.set(fl);
						importAnalysis(fl.rawData as AJson);
						goto(resolve('/flight/results'));
            onload();
					})
				);
			} else if (duplicate) {
				throw new Error('Duplicate flight');
			}
		});
}
