import { writable, type Writable } from 'svelte/store';
import { Flight } from '$lib/database/flight';
import { dev as isdev } from '$app/environment';
import { newCookieStore } from '$lib/utils/cookieStore';
import { type AxiosProgressEvent } from 'axios';
import {user} from '$lib/stores/user';
import { dbServer } from '$lib/api';

export const mouse = writable({ x: 0, y: 0 });

export const lastErrorCode: Writable<number | undefined> = writable();
export const lastErrorText: Writable<string | undefined> = writable();
export const lastErrorDetail: Writable<string | undefined> = writable();

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
	return direction == 'upload'
		? { onUploadProgress: fun }
		: { onDownloadProgress: fun };
};

export const unblockProgress = () => {
	blockingProgressTitle.set(undefined);
	blockingProgress.set(undefined);
};


export const news: Writable<[]> = writable([]);

user.subscribe((u) => {
  dbServer
    .get('news', { validateStatus: (status) => status == 200 })
    .then((res) => {news.set(res.data.results)})
    .catch((err) => {
      console.error(err);
      news.set([]);
    })
});