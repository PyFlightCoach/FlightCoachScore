import { writable, type Writable } from 'svelte/store';


export const mouse = writable({ x: 0, y: 0 });

export const lastErrorCode: Writable<number|undefined> = writable(undefined);
export const lastErrorText: Writable<string|undefined> = writable(undefined);
export const lastErrorDetail: Writable<string|undefined> = writable(undefined);

export const loading: Writable<boolean | undefined> = writable(undefined);




