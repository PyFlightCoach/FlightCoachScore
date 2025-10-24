import { checkUser } from '$lib/stores/user.js';


export async function load() {
  await checkUser();
}