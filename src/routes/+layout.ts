export const prerender = true;
export const ssr=false;

import { dbServer } from "$lib/api";
import {user} from "$lib/stores/user";

export function load() {
  dbServer.get("/users/me").then((res) => {
    if (res) {
      user.set(res);
    }
  });
}