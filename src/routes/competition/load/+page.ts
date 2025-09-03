import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { activeComp } from '$lib/stores/contests';
import { ContestManager } from '$lib/competitions/compthings/ContestManager.js';

export async function load({ url }) {
	
  ContestManager.load(url.searchParams.get('id') || '')
    .then((manager) => {
      activeComp.set(manager);
      goto(base + '/competition/view');
    })
    .catch(() => {
      alert(`Competition not found`);
      goto(base + "/");
    });
	
}
