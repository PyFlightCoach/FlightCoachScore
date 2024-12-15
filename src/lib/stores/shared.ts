import { writable, type Writable } from 'svelte/store';
import { Flight } from '$lib/database/flight';
import {dev as isdev} from '$app/environment';

export const mouse = writable({ x: 0, y: 0 });

export const lastErrorCode: Writable<number|undefined> = writable();
export const lastErrorText: Writable<string|undefined> = writable();
export const lastErrorDetail: Writable<string|undefined> = writable();

export const loading: Writable<boolean | undefined> = writable();

export const activeFlight: Writable<Flight | undefined> = writable(); 
export const isAnalysisModified: Writable<boolean | undefined> = writable();

export const dataSource: Writable<string | undefined> = writable();

export const dev: Writable<boolean> = writable(isdev);

export const help: Writable<string | undefined> = writable();


export const windowWidth: Writable<number> = writable(1000); 
export const windowHeight: Writable<number> = writable(1000); 