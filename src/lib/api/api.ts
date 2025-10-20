import { newCookieStore } from '$lib/utils/cookieStore';
import { type Writable, writable} from 'svelte/store';
import axios, {type AxiosInstance }  from 'axios';

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
export let dbServer: AxiosInstance;



export const dbServers = {
	uk: 'https://flightcoach.org:5012',
	dev: 'https://flightcoach.org:5022',
  local: 'http://localhost:8000'
};

export const anServers = {
	uk: 'https://flightcoach.org:5010',
	dev: 'https://flightcoach.org:5020',
  local: 'http://localhost:5000'
};

export const servers = newCookieStore('server', 'uk', (value) => {
  console.info("Switching DB server to:", dbServers[value as keyof typeof dbServers]);
  console.info("Switching Analysis server to:", anServers[value as keyof typeof anServers]);
  dbServer = axios.create({
    baseURL: dbServers[value as keyof typeof dbServers],
    withCredentials: true
  });
  analysisServer = axios.create({
    baseURL: anServers[value as keyof typeof anServers],
  });
  
  
});

