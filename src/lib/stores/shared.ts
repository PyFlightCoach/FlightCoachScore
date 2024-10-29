
import { writable } from 'svelte/store';


export const mouse = writable({ x: 0, y: 0 });

export const lastErrorCode = writable<number|undefined>(undefined);
export const lastErrorText = writable<string|undefined>(undefined);
export const lastErrorDetail = writable<string|undefined>(undefined);