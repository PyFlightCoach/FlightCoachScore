import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { flight } from '$lib/stores/shared';

export async function load({fetch}) {
	if (!get(flight)) {
		//if (get(dev) && confirm("no data loaded, load test data ?")) {
    //  await fetch('/st.csv').then(r=>r.text()).then(text => states.set(States.read_csv(text)));
    //} else {
			goto(resolve('/flight/create/bin'));
		//}
	} 

}
