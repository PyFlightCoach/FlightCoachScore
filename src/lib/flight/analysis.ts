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
import { Splitting } from '$lib/flight/splitting';
import { FCJManResult, Origin, ScheduleInfo } from './fcjson';
import { library } from '$lib/schedule/library';
import { analysisServer, dbServer } from '$lib/api/api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { prettyPrintHttpError } from '$lib/utils/text';
import { FlightDataSource } from './flight';
import type { AJson, AJMan } from './ajson';
import { States } from '$lib/utils/state';
import { checkUser } from '$lib/stores/user';
import { BinData } from './bin';
import { objmap } from '$lib/utils/arrays';

export function checkComplete() {
	return Boolean(
		get(sts.manNames)?.length &&
			sts.analyses.every((a) => get(a) && get(a)?.history[get(faVersion)!]?.results?.length)
	);
}

export function clearAnalysis() {
	console.log('clearing analysis');
	sts.origin.set(undefined);
	sts.selManID.set(undefined);
	sts.manNames.set(undefined);
	sts.scores.set(undefined);
	sts.selectedResult.set(undefined);
	sts.fa_versions.set([]);
	sts.analyses.length = 0;
	sts.running.set([]);
	sts.runInfo.length = 0;
	isAnalysisModified.set(undefined);
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

export function clearDataLoading() {
	console.log('clearing data loading');
	activeFlight.set(undefined);
	clearAnalysis();
	goto(resolve('/'));
}

export async function newAnalysis(flight: FlightDataSource) {
	if (
		!(flight.rawData instanceof BinData) &&
		!(flight.rawData instanceof States)
	) {
		return importAnalysis(flight.rawData!);
	}
	const segmentation = await flight.segmentation!.loadManDefs();
	sts.origin.set(flight.origin);
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
		const sch = segmentation.mans[id].schedule;

		const data = flight.slice(id);

		setAnalysis(
			i,
			new MA(
				segmentation.mans[id].name,
				id,
				new ScheduleInfo(sch.category_name, sch.schedule_name),
				direction,
				data,
				segmentation.mans[id].mdef!,
				objmap(flight.history[i] || {}, (_, v) => FCJManResult.parse(v as Record<string, unknown>)),
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
	sts.origin.set(Object.setPrototypeOf(data.origin, Origin.prototype));
	setupAnalysisArrays(data.mans.map((m) => m.name));

	const mbuilders = data.mans.map(async (ma: AJMan, i: number) => {
		sts.runInfo[i].set(`Imported Analysis at ${new Date().toLocaleTimeString()}`);

		return MA.parse(ma, get(sts.origin)!).then(async (res) => {
			setAnalysis(i, res);
		});
	});
  await Promise.all(mbuilders);
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
		return importAnalysis(get(activeFlight)!.rawData as AJson);
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
			//importAnalysis(f.rawData as AJson);
			activeFlight.set(f);
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
	clearDataLoading();
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
					Origin.parse(response.data.origin),
					Splitting.default(response.data.data.length),
					undefined,
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

export async function checkDuplicate(md5: string, onload: () => void = () => {}) {
	return dbServer
		.get(`flight/check_duplicate/${md5}`)
		.then(() => {
			return undefined;
		})
		.catch((err) => {
			if (err.status === 409) {
        const detail: string | {is_a_duplicate: boolean; reason: string; id: string} = err.response.data.detail
				return typeof detail == 'string' ? detail.split('id[')[1].split(']')[0] : detail.id;
			} else {
        console.error(err);
				alert('Error checking duplicate: ' + prettyPrintHttpError(err));
			}
		})
		.then(async (duplicate: string | undefined) => {
			if (duplicate && confirm('BIN file already exists on server, do you want to load it?')) {
				return checkUser().then(() => FlightDataSource.db(duplicate))
          .then((fl) => {
            activeFlight.set(fl);
            return importAnalysis(fl.rawData as AJson)
          })
          .then(()=>{
            goto(resolve('/flight/results'));
            onload();
          });
			} 
		});
}
