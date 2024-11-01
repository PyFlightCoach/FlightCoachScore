import {user} from "$lib/stores/user";
import {get} from "svelte/store";
import {goto} from "$app/navigation";
import {base} from "$app/paths";

export function load() {
  if (!get(user)) {
    goto(base + '/user/login');
  }
}