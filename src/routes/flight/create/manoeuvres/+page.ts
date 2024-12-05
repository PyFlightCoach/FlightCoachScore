import { binData, origin, states } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { States } from '$lib/analysis/state';
import { dev } from '$app/environment';
import { loadKnowns } from '$lib/schedules';


export async function load({fetch}) {
  loadKnowns();
	if (get(binData) && get(origin)) {
		states.set(States.from_xkf1(get(origin)!, get(binData)!.orgn, get(binData)!.xkf1));
  } else if (!get(states)) {
		if (dev) {
      await fetch('/st.csv').then(r=>r.text()).then(text => states.set(States.read_csv(text)));
    } else {
			goto(base + '/flight/create/data');
		}
	}  
}
