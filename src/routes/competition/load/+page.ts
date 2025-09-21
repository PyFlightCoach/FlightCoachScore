import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { activeComp } from '$lib/stores/contests';
import { ContestManager } from '$lib/competitions/compthings/ContestManager.js';

export async function load({ url }) {
	
  ContestManager.load(url.searchParams.get('id') || '')
    .then((manager) => {
      activeComp.set(manager);
      goto(resolve('/competition/view'), {replaceState: true});
    })
    .catch(() => {
      alert(`Competition not found`);
      goto(resolve('/'), {replaceState: true});
    });
	
}
