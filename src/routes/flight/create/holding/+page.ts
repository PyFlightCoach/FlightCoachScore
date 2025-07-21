import { dbServer } from '$lib/api/api.js';
import { loadAJson } from '$lib/flight/analysis.js';
import { blockProgress, unblockProgress } from '$lib/stores/shared';
import JSZip from 'jszip';
import {  decompressLZMA } from "$lib/utils/zip";

//LZMA.compress(string || byte_array, mode, on_finish(result, error) {}, on_progress(percent) {});
//LZMA.decompress(byte_array, on_finish(result, error) {}, on_progress(percent) {});


export async function load({ url }) {
	//TODO currently this reads from a db entry and simulates the metadata by reading the ajson.
	// need to change to the holding roots when they are available.
	const id = url.searchParams.get('id');
	const zip = new JSZip();
	const binfile = await dbServer
		.get(`flight/bin/${id}`, {
			responseType: 'arraybuffer',
			...blockProgress(`Loading BIN ${id} from Database`)
		})
//    .then((response) => zip.loadAsync(response.data))
//    .then((archive) => archive.files['flightlog.bin'].async('arraybuffer'))
    .then((response) =>  decompressLZMA(response.data))
		.then((res) => {
			return new File([res], 'flightlog.bin');
		})
		.catch((e) => {console.error(e); throw e;})
		.finally(() => {
			unblockProgress();
		});
	const ajson = await loadAJson(id!);

	const origin = ajson.origin;

  const mans = ajson.mans.map(m=>[m.flown[0].t, m.flown[m.flown.length-1].t])
	const sinfo = ajson.mans[0].schedule;
	return { bin: binfile, origin, mans, sinfo };
}
