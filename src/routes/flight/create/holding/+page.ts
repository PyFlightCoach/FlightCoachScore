import { dbServer } from '$lib/api/api.js';
import { loadAJson } from '$lib/flight/analysis.js';
import { blockProgress, unblockProgress } from '$lib/stores/shared';
import JSZip from 'jszip';

export async function load({ url }) {
	//TODO currently this reads from a db entry and simulates the metadata by reading the ajson.
  // need to change to the holding roots when they are available.
	const id = url.searchParams.get('id');
	const zip = new JSZip();
	const binfile = await dbServer
		.get(`flight/bin/${id}`, {
			responseType: 'blob',
			...blockProgress(`Loading BIN ${id} from Database`)
		})
		.then((response) => zip.loadAsync(response.data))
		.then((res) => res.files["flightlog.bin"].async('arraybuffer'))
		.then((res) => {
			return new File([res], 'flightlog.bin');
		})
		.catch(() => {})
		.finally(() => {
			unblockProgress();
		});
  const ajson = await loadAJson(id!);
  
  const origin = ajson.origin;
  const mans = ajson.mans.map(m=>{return {start:m.flown[0].t, stop: m.flown[m.flown.length-1].t}})
  const sinfo =ajson.mans[0].schedule;
	console.log(await binfile.text());
	return { bin: binfile , origin, mans, sinfo};
}
