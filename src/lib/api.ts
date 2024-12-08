import { newCookieStore } from '$lib/utils/cookieStore';
import { type Writable, writable, get } from 'svelte/store';
import { dev } from '$app/environment';

export class Server {
	constructor(readonly address: string) {}

	async handleResponse(response: Response, key: keyof Response = 'json') {
		if (response.ok) {
			console.debug(`${this.address}: OK`);
			try {
				return typeof response[key] === 'function' ? await response[key]() : response[key];
			} catch {
				return;
			}
		} else {
			throw new Error(
				`${this.address}: Error ${response.statusText}: ${(await response.json()).detail}`
			);
		}
	}

	async fetch(
		method: string,
		path: string,
		cookie: string | undefined = undefined,
		data: Record<string, unknown> | FormData | undefined = undefined,
		key: keyof Response = 'json'
	) {
		const _path = `${this.address}/${path.replace(/^\/+/g, '')}`;
		const _request: RequestInit = {
			method: method,
			headers: {
				...(cookie ? { Cookie: cookie } : {}),
				...(data && !(data instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
			},
			credentials: 'include',
			...(data ? { body: data instanceof FormData ? data : JSON.stringify(data) } : {})
		};
		return await this.handleResponse(await fetch(_path, _request), key);
	}

	async get(
		path: string,
		data: Record<string, string> | FormData | undefined = undefined,
		key: keyof Response = 'json'
	) {
		if (data) {
			path += '?' + new URLSearchParams(data).toString();
		}
		return await this.fetch('GET', path, undefined, undefined, key);
	}

	async post(path: string, data: Record<string, unknown> | FormData, key: keyof Response = 'json') {
		return await this.fetch('POST', path, undefined, data, key);
	}

	async patch(
		path: string,
		data: Record<string, unknown> | FormData,
		key: keyof Response = 'json'
	) {
		return await this.fetch('PATCH', path, undefined, data, key);
	}
}

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

// The rest is all logic to handle the selection of analysis and db server addesses

export let analysisServer: Server;
export const anServerAddress: Writable<string> = writable();

export const customAnalysisServer = newCookieStore('customAnalysisServer', 'http://localhost:5000');

export const an_servers = {
	uk: 'https://madeupmodels.com:5010',
	pre: 'https://madeupmodels.com:5020'
};

export const anSOption = newCookieStore('anSOption', 'uk', (value) => {
  if (dev) {
    if (Object.keys(an_servers).includes(value)) {
      anServerAddress.set(an_servers[value as keyof typeof an_servers]);
    } else {
      anServerAddress.set(get(customAnalysisServer));
    }
  } else { 
    anServerAddress.set(an_servers['uk']);
  }
	
});

customAnalysisServer.subscribe((value) => {
	if (!Object.keys(an_servers).includes(value)) {
		anServerAddress.set(value);
	}
});

export const faVersion: Writable<string | undefined> = writable(undefined);

anServerAddress.subscribe((value: string) => {
	analysisServer = new Server(value);
	analysisServer
		.get('fa_version')
		.then((res) => faVersion.set(res))
		.catch(() => faVersion.set(undefined));
});

export let dbServer: Server;
export const dbServerAddress: Writable<string> = writable();

export const customDbServer = newCookieStore('customDbServer', 'http://localhost:8000');
export const ukDBServer = 'https://madeupmodels.com:5012';

export const dbSOption = newCookieStore('dbSOption', 'uk', (value) => {
	if (dev) {
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
	if (get(dbSOption) != 'uk') {
		dbServerAddress.set(value);
	}
});

dbServerAddress.subscribe((value: string) => {
	dbServer = new Server(value);
});

if (!dev) {
	anSOption.set('uk');
	dbSOption.set('uk');
}
