import { binData, origin, states, fcj, updateSplits, manSplits } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { States } from '$lib/utils/state';
import { dev } from '$lib/stores/shared';


export async function load({fetch}) {
	if (get(binData) && get(origin)) {
		states.set(States.from_xkf1(get(origin)!, get(binData)!.orgn, get(binData)!.xkf1));
  } else if (!get(states)) {
		if (get(dev) && confirm("no data loaded, load test data ?")) {
      await fetch('/st.csv').then(r=>r.text()).then(text => states.set(States.read_csv(text)));
    } else {
			goto(base + '/flight/create/data');
		}
	} 
  if (get(fcj)) (await updateSplits(get(fcj)!));
  
  return {baseSplits: get(manSplits)};
}
