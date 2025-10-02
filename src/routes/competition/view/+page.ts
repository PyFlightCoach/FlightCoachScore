import { activeComp } from '$lib/stores/contests';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';
import { get } from 'svelte/store';
import { checkUser } from '$lib/stores/user.js';

export async function load({ url }) {
	const id = url.searchParams.get('id');
  await checkUser();
	if (id) {
		await ContestManager.load(url.searchParams.get('id') || '')
			.then((manager) => {
				activeComp.set(manager);
			})
			.catch(() => {
				alert(`Competition not found`);
			});
	} else if (!id && get(activeComp)) {
    goto(resolve("/competition/view/") + `?id=${get(activeComp)!.summary.id}`, { replaceState: true });
  }
  if (!get(activeComp)) {
    goto(resolve('/'), { replaceState: true });
  }

}
