import { dbServer } from '$lib/api/api.js';
import { Origin, ScheduleInfo } from '$lib/flight/fcjson.js';
import { blockProgress, unblockProgress } from '$lib/stores/shared';
import JSZip from 'jszip';
import {library} from '$lib/schedule/library';
import { get } from 'svelte/store';

//LZMA.compress(string || byte_array, mode, on_finish(result, error) {}, on_progress(percent) {});
//LZMA.decompress(byte_array, on_finish(result, error) {}, on_progress(percent) {});


export async function load({ url }) {
	//TODO currently this reads from a db entry and simulates the metadata by reading the ajson.
	// need to change to the holding roots when they are available.
	
  const id = url.searchParams.get('id');

	const binPromise = dbServer
		.get(`flight/holding/bin/${id}`, {
			responseType: 'arraybuffer',
			...blockProgress(`Loading BIN ${id} from Database`)
		})
    .then((response) => (new JSZip()).loadAsync(response.data))
    .then((archive) => archive.files['flightlog.bin'].async('arraybuffer'))
    .then((res) => {
			return new File([res], 'flightlog.bin');
		})
	
  const dataPromise = dbServer
    .get(`flight/holding/meta/${id}`, {
      responseType: 'json',
      ...blockProgress(`Loading Metadata ${id} from Database`)
    })
    .then((response) => {
      return JSON.parse(response.data.data);
    })
  
  const [bin, metadata] = await Promise.all([binPromise, dataPromise])
    .catch((e) => {console.error(e); throw e;})
    .finally(unblockProgress);

  const origin = Object.setPrototypeOf(metadata.origin, Origin.prototype);
 
  const splits = metadata.splits;
	const sinfo = await ScheduleInfo.from_fcj_sch(metadata.schedule).to_pfc();

  const schedule = get(library).subset({category_name:sinfo.category, schedule_name:sinfo.name}).only;


  return { bin, origin, splits, schedule };

}
