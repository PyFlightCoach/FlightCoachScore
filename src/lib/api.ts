import { newCookieStore } from '$lib/utils/cookieStore';

export class Server {
	constructor(readonly address: string) {}

	async handleResponse(response: Response) {
		if (response.ok) {
      console.log(`${this.address}: OK`);
			return await response.json();
		} else {
			throw new Error(`${this.address}: Error ${response.statusText}: ${(await response.json()).detail}`);
		}
	}

  async fetch(method: string, path: string, cookie: string|undefined=undefined, data: Record<string, unknown>|undefined=undefined) {
    console.log(`${this.address}: ${method} ${path}`);
    return await this.handleResponse(
      await fetch(`${this.address}${path}`, {
        method: method,
        headers: {
          ...(cookie && {Cookie: cookie}),
          ...(data && {contentType: 'application/json'})
        },
        credentials: 'include',
        ...(data && {body: JSON.stringify(data)})
      })
    );
  }

	async get(path: string, cookie: string|undefined=undefined) {
		return await this.fetch('GET', path, cookie);
	}
	async post(path: string, cookie: string|undefined=undefined, data: Record<string, unknown>) {
		return await this.fetch('POST', path, cookie, data);
	}

	async patch(path: string, cookie: string|undefined=undefined, data: Record<string, unknown>) {
		return await this.fetch('PATCH', path, cookie, data)  
  }
}

export let analysisServer: Server;
export const ukAnalysisServer: string = 'https://madeupmodels.com:5010';
export const customAnalysisServer = newCookieStore('customAnalysisServer', 'https://localhost:5000');
export const analysisServerAddress = newCookieStore(
  'analysisServer', 
  ukAnalysisServer,
  (value) => {analysisServer=new Server(value)}
);

export let dbServer: Server;
export const ukDBServer: string = 'https://madeupmodels.com:5000';
export const customDBServer = newCookieStore('customAnalysisServer', 'https://localhost:5010');
export const dbServerAddress = newCookieStore(
  'dbServer', 
  ukDBServer,
  (value) => {dbServer=new Server(value)}
);
