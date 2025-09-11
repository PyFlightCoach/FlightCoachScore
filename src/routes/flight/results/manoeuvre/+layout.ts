import {goto} from '$app/navigation';
import {resolve} from '$app/paths';
import { get } from 'svelte/store';
import {  selManID, analyses } from '$lib/stores/analysis';
import type { MA } from '$lib/manoeuvre/analysis';
import { analyseManoeuvre } from '$lib/flight/analysis';

export async function load({url}) {  
  
  if (get(selManID)==undefined) {
    goto(resolve('/flight/results'));
  } 
  
  console.log(url.pathname);
  console.log(url);

  const fullAnalysisPaths = ["intra", "inter", "positioning", "templates"];

  if (fullAnalysisPaths.some(path => url.pathname.includes(path))) {
    const ma = get(analyses[get(selManID)!])!;
    if (!ma.scores) {
      if (confirm("Full analysis data not loaded for this manoeuvre, do you want to load it now?")) {
        await analyseManoeuvre(get(selManID)!, false);
      } else {
        goto(resolve('/flight/results/'));
      }
      
    }
  }


}