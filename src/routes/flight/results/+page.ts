
import { activeFlight } from "$lib/stores/shared";
import { clearAnalysis, createAnalysisExport, newAnalysis } from "$lib/flight/analysis";
import { get } from "svelte/store";
import { manNames, origin } from "$lib/stores/analysis";
import { goto } from "$app/navigation";
import {resolve} from '$app/paths';
import { Splitting } from "$lib/flight/splitting";
import { Origin } from "$lib/flight/fcjson";


export async function load() {
  if (!get(activeFlight)) {
    console.log("Cant load analysis if no active flight")
    goto(resolve("/"))
  }
  
  if (get(manNames)) {
    const oldSegmentation = await Splitting.parseAJson(createAnalysisExport(true));
    

    const newSplit = !Splitting.equals(oldSegmentation, get(activeFlight)!.segmentation);
    const newOrigin = !Origin.equals(get(origin), get(activeFlight)!.origin);

    if (
      newSplit || newOrigin
    ) {
      console.log(`reloading analysis for new segmentation: ${newSplit}, origin: ${newOrigin} `)
      clearAnalysis();
      newAnalysis(get(activeFlight)!);
    } else {
      console.log("Existing analysis not modified")
    }
    
  } else {
    console.log("loading new analysis")
    newAnalysis(get(activeFlight)!);
  }
  
  
  

}