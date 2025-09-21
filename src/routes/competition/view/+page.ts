import { activeComp } from "$lib/stores/contests";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { get } from "svelte/store";

export function load() {
  if (!get(activeComp)) {
    goto(resolve("/"));
  }
}