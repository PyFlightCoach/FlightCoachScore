
import { activeFlight } from "$lib/stores/shared";
import { clearAnalysis, newAnalysis } from "$lib/flight/analysis";
import { get } from "svelte/store";
import { manNames} from "$lib/stores/analysis";
import { goto } from "$app/navigation";
import {resolve} from '$app/paths';


export async function load() {
  if (!get(activeFlight)) {
    console.log("Cant load analysis if no active flight")
    goto(resolve("/"))
  }
  
  if (get(manNames)) {
    if (get(activeFlight)!.updated) {
      console.log("Flight data input updated, reloading analysis")
      clearAnalysis();
      newAnalysis(get(activeFlight)!);
    }
  } else {
    console.log("loading new analysis")
    newAnalysis(get(activeFlight)!);
  }
  
  
  

}