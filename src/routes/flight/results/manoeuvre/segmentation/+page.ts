import { get } from 'svelte/store';

import { selManID, analyses } from '$lib/stores/analysis';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export async function load() {
  const an = get(analyses[get(selManID)!])

  if (!an?.flown?.data[0].element) {
    alert('No Aligment information available, cannot edit alignment');
    goto(resolve('/flight/results/manoeuvre'));
  }

}
