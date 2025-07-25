import { writable, type Writable } from 'svelte/store';
import { Flight } from '$lib/database/flight';
import { dev as isdev } from '$app/environment';
import { newCookieStore } from '$lib/utils/cookieStore';
import { type AxiosProgressEvent } from 'axios';
import { user } from '$lib/stores/user';
import { dbServer, analysisServer} from '$lib/api';
import { loadSchedules } from '$lib/schedule/library';

export const mouse = writable({ x: 0, y: 0 });

export const lastErrorCode: Writable<number | undefined> = writable();
export const lastErrorText: Writable<string | undefined> = writable();
export const lastErrorDetail: Writable<string | undefined> = writable();

export const isFullSize: Writable<boolean> = writable(false);

export const loading: Writable<boolean | undefined> = writable();

export const activeFlight: Writable<Flight | undefined> = writable();
export const isAnalysisModified: Writable<boolean | undefined> = writable();

export const dataSource: Writable<string | undefined> = writable();

export const dev: Writable<boolean> = writable(isdev);

export const help: Writable<string | undefined> = writable();

export const windowWidth: Writable<number> = writable(1000);
export const windowHeight: Writable<number> = writable(1000);

export const siteInputMode = newCookieStore('siteInputMode', 'fcsites');

export const blockingProgressTitle: Writable<string | undefined> = writable();
export const blockingProgress: Writable<number | undefined> = writable();

export const blockProgress = (
	description: string,
	direction: 'upload' | 'download' = 'download'
) => {
	blockingProgressTitle.set(description);
	const fun = (progressEvent: AxiosProgressEvent) => {
		blockingProgress.set(progressEvent.progress);
	};
	return direction == 'upload' ? { onUploadProgress: fun } : { onDownloadProgress: fun };
};

export const unblockProgress = () => {
	blockingProgressTitle.set(undefined);
	blockingProgress.set(undefined);
};

export const news: Writable<[]> = writable([]);

export async function loadNews() {
  dbServer
		.get('news', { validateStatus: (status) => status == 200 })
    .then((res) => {
			news.set(res.data.results);
		})
		.catch(() => {
			news.set([]);
		});
}

export function clearNews() {news.set([])};


export const faVersion: Writable<string | undefined> = writable(undefined);

export async function loadFAVersion() {
  await analysisServer
		.get('fa_version')
		.then((res) => {
      faVersion.set(res.data);
      console.info("Current analysis version:", res.data);
    })
		.catch((e) => {
      faVersion.set(undefined);
      console.error("Failed to load FA version from analysis server:", e);
    });
}
export const allFAVersions: Writable<string[]> = writable([]);
export const activeScheduleIDs: Writable<string[]> = writable([]);

export async function loadGuiLists() {
	await dbServer
		.get('analysis/guilists')
		.then((res) => {
			allFAVersions.set(res.data.fa_versions);
			activeScheduleIDs.set(res.data.active_schedule_ids);
      console.info("Loaded gui_lists");
		})
		.catch((e) => {
			allFAVersions.set([]);
			activeScheduleIDs.set([]);
      throw new Error("Failed to load gui_lists", e);
		});
}




export const rules: Writable<string[] | undefined> = writable();

export async function loadRules() {
  await analysisServer
    .get('rules')
    .then((res) => rules.set(res.data))
    .catch((e) => {
      rules.set(undefined);
      throw new Error("Failed to load rules", e);
    });
}
