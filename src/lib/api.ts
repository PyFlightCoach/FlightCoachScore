import { newCookieStore } from '$lib/utils/cookieStore';
import { type Writable, writable, get } from 'svelte/store';
import { dev } from '$app/environment';
import axios, {type AxiosInstance }  from 'axios';
import { user } from '$lib/stores/user';


// The rest is all logic to handle the selection of analysis and db server addesses
export function jsonEscapeUTF(s: string) {
	return s.replace(
		/[^\x20-\x7F]/g,
		(x) => '\\u' + ('000' + x!.codePointAt(0)!.toString(16)).slice(-4)
	);
}

export function formDataFromDict(data: unknown) {
	const fd = new FormData();
	Object.entries(data as Record<string, never>).forEach(([k, v]) => {
		fd.append(k, v);
	});
	return fd;
}



export let analysisServer: AxiosInstance;
export const anServerAddress: Writable<string> = writable();

export const customAnalysisServer = newCookieStore('customAnalysisServer', 'http://localhost:5000');

export const an_servers = {
	uk: 'https://madeupmodels.com:5010',
	pre: 'https://madeupmodels.com:5020'
};

export const anSOption = newCookieStore('anSOption', 'uk', (value) => {
  if (dev || get(user)?.is_superuser) {
    if (Object.keys(an_servers).includes(value)) {
      anServerAddress.set(an_servers[value as keyof typeof an_servers]);
    } else {
      anServerAddress.set(get(customAnalysisServer));
    }
  } else { 
    anServerAddress.set(an_servers.uk);
  }
	
});

customAnalysisServer.subscribe((value) => {
	if (get(anSOption)=='custom') {
		anServerAddress.set(value);
	}
});

export const faVersion: Writable<string | undefined> = writable(undefined);

anServerAddress.subscribe((value: string) => {
	analysisServer = axios.create({
    baseURL: value
  });
  analysisServer
		.get('fa_version')
		.then((res) => faVersion.set(res.data))
		.catch(() => faVersion.set(undefined));
});

export let dbServer: AxiosInstance;
export const dbServerAddress: Writable<string> = writable();

export const customDbServer = newCookieStore('customDbServer', 'http://localhost:8000');
export const ukDBServer = 'https://madeupmodels.com:5012';

export const dbSOption = newCookieStore('dbSOption', 'uk', (value) => {
	if (dev || get(user)?.is_superuser) {
		switch (value) {
			case 'uk':
				dbServerAddress.set(ukDBServer);
				break;
			default:
				dbServerAddress.set(get(customDbServer));
		} 
	} else { 
    dbServerAddress.set(ukDBServer);
  }
});

customDbServer.subscribe((value) => {
	if (get(dbSOption) == 'custom') {
		dbServerAddress.set(value);
	}
});

dbServerAddress.subscribe((value: string) => {
	dbServer = axios.create({
    baseURL: value,
    withCredentials: true
  });
  
});

if (!dev) {
	anSOption.set('uk');
	dbSOption.set('uk');
}
