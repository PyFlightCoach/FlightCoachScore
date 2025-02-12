import { states, manSplits } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { States } from '$lib/utils/state';
import { dev } from '$lib/stores/shared';


export async function load({fetch}) {
	if (!get(states)) {
		if (get(dev) && confirm("no data loaded, load test data ?")) {
      await fetch('/st.csv').then(r=>r.text()).then(text => states.set(States.read_csv(text)));
    } else {
			goto(base + '/flight/create/data');
		}
	} 

  
  
  return {baseSplits: get(manSplits)};
}
