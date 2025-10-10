import { servers } from '$lib/api/api';
import {  serverDataLoaded, loadAllServerData } from '$lib/stores/shared';
import { checkUser } from '$lib/stores/user.js';
import { get } from 'svelte/store';

export const prerender = true;
export const ssr = false;
export const trailingSlash = 'always';

async function setServer(location: string) {
  if (get(servers) !== location || !get(serverDataLoaded)) {
    servers.set(location);
    console.log(`Changing to ${location} server`);
    await loadAllServerData();
  }
}

export async function load({ url}) {

  const mainServer = url.searchParams.get('main') === '';
  const devServer = url.searchParams.get('dev') === '';
  const localServer = url.searchParams.get('local') === '';

  const promise1 = setServer(mainServer ? 'uk' : devServer ? 'dev' : localServer ? 'local' : get(servers));
  
  checkUser(false, false, false)
    .then((u) => {
      if (u) {
        console.log('User is logged in, loading user data') ;
      }
    })
    .catch(() => {
      console.log('User not logged in');
    });
  await promise1;
}
