import { writable, type Writable } from 'svelte/store';
import { analysisServer } from '$lib/api';
import { FCJson, Origin, ScheduleInfo } from '$lib/analysis/fcjson';
import { States } from '$lib/analysis/state';
import { MA } from '$lib/analysis/ma';
import { get } from 'svelte/store';
import { ManDetails } from '$lib/analysis/splitting';
import { BinData } from '$lib/analysis/bindata';

export const isCompFlight: Writable<boolean> = writable(true);

export const bin: Writable<File | undefined> = writable();
export const binData: Writable<BinData | undefined> = writable();
export const bootTime: Writable<Date | undefined> = writable();
export const origin: Writable<Origin|undefined> = writable();

export const states: Writable<States | undefined> = writable();

export const manNames: Writable<string[]> = writable();
export const analyses: Writable<MA | undefined>[] = [];
export const running: Writable<boolean>[] = [];
export const runInfo: Writable<string>[] = [];
export const scores: Writable<number[]> = writable();
export const totalScore: Writable<string> = writable('---');
export const fa_versions: Writable<string[]> = writable([]);


fa_versions.subscribe((value) => {
  if (value.length > 0) {
    selectedResult.set(value[value.length - 1]);
  }
});

export const selectedResult: Writable<string | undefined> = writable();
export const difficulty: Writable<number> = writable(3);
export const truncate: Writable<boolean> = writable(false);
export const selManID: Writable<number | undefined> = writable();

scores.subscribe((value) => {
	totalScore.set(value ? value.reduce((a, b) => a + b, 0).toFixed(2) : '---');
});

function updateScores(result: string | undefined, diff: number, trunc: boolean) {
  if (result) {
    scores.set(
      analyses.map((a) => {
        const ma = get(a);
        return ma ? ma.get_score(result, diff, trunc).total * (ma.mdef?.info.k | ma.k) : 0;
      })
    );
  }
}

selectedResult.subscribe((value) => {
  updateScores(value, get(difficulty), get(truncate));
});

difficulty.subscribe((value) => {
	updateScores(get(selectedResult), value, get(truncate));
});

truncate.subscribe((value) => {
	updateScores(get(selectedResult), get(difficulty), value);
});


export const manoeuvres: Writable<Record<string, ManDetails[]>> = writable({});
export const schedules: Writable<Record<string, string[]>> = writable({});
export const categories: Writable<string[]> = writable([]);

export async function loadCategories() {
	if (get(categories).length == 0) {
		categories.set(await analysisServer.get('categories'));
	}
	return get(categories);
}

export async function loadSchedules(category: string) {
	if (!schedules[category]) {
		await serverFunc(`${category}/schedules`, {}, 'GET').then((res) => {
			schedules.update((s) => {
				s[category] = res;
				return s;
			});
		});
	}
	return get(schedules)[category];
}

export async function loadManoeuvres(category: string, schedule: string) {
	const sinfo = new ScheduleInfo(category, schedule);

	if (!manoeuvres[sinfo.to_string()]) {
		await serverFunc(`${category}/${schedule}/manoeuvres`, {}, 'GET').then((pfcMans) => {
			manoeuvres.update((mans) => {
				mans[`${category}_${schedule}`] = pfcMans.map(
					(m) => new ManDetails(m.name, m.id, m.k, sinfo)
				);
				return mans;
			});
		});
	}
	return get(manoeuvres)[sinfo.to_string()];
}
