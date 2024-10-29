import { newCookieStore } from '$lib/utils/cookieStore';
import { goto } from '$app/navigation';

export class Server {
	constructor(readonly address: string) {}

	async handleResponse(response: Response) {
		if (response.ok) {
      console.log(`${this.address}: OK`);
      try {
        return await response.json();
      } catch {
        return;
      }
			
		} else {
      console.log(response)
			throw new Error(`${this.address}: Error ${response.statusText}: ${(await response.json()).detail}`);
		}
	}

  async fetch(method: string, path: string, cookie: string|undefined=undefined, data: Record<string, any>|undefined=undefined) {
    const _path = `${this.address}/${path.replace(/^\/+/g, "")}`
    const _request = {
      method: method,
      headers: ({
        ...(cookie ? {Cookie: cookie} : {}),
        ...(data && !(data instanceof FormData) ? {"Content-Type": 'application/json'} : {})
      }),
      credentials: 'include',
      ...(data ? {body: (data instanceof FormData) ? data : JSON.stringify(data)} : {})
    };
    console.log(_path);
    console.log(_request);
    return await this.handleResponse(
      await fetch(_path, _request)
    );
  }

	async get(path: string, cookie: string|undefined=undefined) {
		return await this.fetch('GET', path, cookie);
	}
	async post(path: string, data: Record<string, any>, cookie: string|undefined=undefined) {
		return await this.fetch('POST', path, cookie, data);
	}

	async patch(path: string, data: Record<string, any>, cookie: string|undefined=undefined) {
		return await this.fetch('PATCH', path, cookie, data)  
  }
}



export function jsonEscapeUTF(s: string) {
	return s.replace(/[^\x20-\x7F]/g, x => "\\u" + ("000"+x!.codePointAt(0)!.toString(16)).slice(-4))
}

export function formDataFromDict(data: Record<string, any>) {
  const fd = new FormData()
  Object.entries(data).forEach(([k,v])=>{fd.append(k, v)});
  return fd;
}

export let analysisServer: Server;
export const ukAnalysisServer: string = 'https://madeupmodels.com:5010';
export const customAnalysisServer = newCookieStore('customAnalysisServer', 'http://localhost:5000');
export const analysisServerAddress = newCookieStore(
  'analysisServer', 
  ukAnalysisServer,
  (value) => {analysisServer=new Server(value)}
);

export let dbServer: Server;
export const ukDBServer: string = 'https://madeupmodels.com:5000';
export const customDBServer = newCookieStore('customDBServer', 'http://localhost:8000');
export const dbServerAddress = newCookieStore(
  'dbServer', 
  ukDBServer,
  (value) => {dbServer=new Server(value)}
);
