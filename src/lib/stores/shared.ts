import { writable, type Writable } from 'svelte/store';
import { Flight } from '$lib/database/flight';
import { dev as isdev } from '$app/environment';
import { newCookieStore } from '$lib/utils/cookieStore';
import { type AxiosProgressEvent } from 'axios';
import { dbServer, analysisServer} from '$lib/api';
import {get} from 'svelte/store';
import { loadedSchedules } from '$lib/schedule/library';
import { reloadSchedules } from '$lib/schedule/library';
import { requestActivity } from '$lib/stores/userActivity';
import { updateCDComps } from '$lib/stores/contests';


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
export const loadedFAVersion: Writable<boolean | string> = writable(false);

export async function loadFAVersion() {
  loadedFAVersion.set(false);
  await analysisServer
		.get('fa_version')
		.then((res) => {
      faVersion.set(res.data);
      loadedFAVersion.set(true);
      console.info("Current analysis version:", res.data);
    })
		.catch((e) => {
      faVersion.set(undefined);
      loadedFAVersion.set(`${e.message}, Failed to read FA version.`);
      throw new Error("Failed to read FA version from analysis server", e);
    });
}

export const allFAVersions: Writable<string[]> = writable([]);
export const activeScheduleIDs: Writable<string[]> = writable([]);
export const loadedGuiLists: Writable<boolean | string> = writable(false);

export async function loadGuiLists() {
  loadedGuiLists.set(false);
	await dbServer
		.get('analysis/guilists')
		.then((res) => {
			allFAVersions.set(res.data.fa_versions);
			activeScheduleIDs.set(res.data.active_schedule_ids);
      loadedGuiLists.set(true);
		})
		.catch((e) => {
			allFAVersions.set([]);
			activeScheduleIDs.set([]);
      loadedGuiLists.set(`${e.message}, Failed to load gui lists.`);
      throw new Error("Failed to load gui_lists", e);
		});
}

export const rules: Writable<string[] | undefined> = writable();
export const loadedRules: Writable<boolean | string> = writable(false);

export async function loadRules() {
  loadedRules.set(false);
  await analysisServer
    .get('rules')
    .then((res) => {
      rules.set(res.data);
      loadedRules.set(true);
    })
    .catch((e) => {
      rules.set(undefined);
      loadedRules.set(`${e.message}, Failed to load rules.`);
      throw new Error("Failed to load rules", e);
    });
}


export const serverDataLoaded: Writable<boolean| string> = writable(false);

function checkServerDataLoaded(msg: boolean | string) {
  let val = get(serverDataLoaded);
  if (typeof msg === 'string') {
    if (typeof val === 'string') {
      val += ` ${msg}`;
    }
    else {
      val = msg;
    }
  } else {
    if (get(loadedGuiLists)==true && get(loadedRules)==true && get(loadedSchedules)==true && get(loadedFAVersion)==true) {
      val = true;
    } 
  }
  serverDataLoaded.set(val);
}
loadedGuiLists.subscribe(checkServerDataLoaded);
loadedRules.subscribe(checkServerDataLoaded);
loadedSchedules.subscribe(checkServerDataLoaded);
loadedFAVersion.subscribe(checkServerDataLoaded); 


export async  function loadAllServerData() {
  serverDataLoaded.set(false);
  return await Promise.all([loadGuiLists(), loadRules(), reloadSchedules(), loadFAVersion(), requestActivity(), updateCDComps(), getUsers()])
    .then(() => {
      console.log('All data loaded successfully.');
      serverDataLoaded.set(true);
    })
    .catch((e) => {
      console.error('Error loading required data', e);
    });
}
import {getUsers} from '$lib/stores/user';