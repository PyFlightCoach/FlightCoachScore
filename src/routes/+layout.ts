import { servers } from '$lib/api/api';
import { loadAllServerData, serverDataLoaded } from '$lib/stores';
import {  help } from '$lib/stores/shared';
import { base } from '$app/paths';
import { get } from 'svelte/store';

export const prerender = true;
export const ssr = false;
export const trailingSlash = 'always';

function setServer(location: string) {
  if (get(servers) !== location || !serverDataLoaded) {
    servers.set(location);
    console.log(`Changing to ${location} server`);
    loadAllServerData();
  }
}

export async function load({ url }) {

  const mainServer = url.searchParams.get('main') === '';
  const devServer = url.searchParams.get('dev') === '';
  const localServer = url.searchParams.get('local') === '';

  console.log('servers options:', mainServer, devServer, localServer);
  setServer(mainServer ? 'uk' : devServer ? 'dev' : localServer ? 'local' : get(servers));
  

	let helpFileName = url.pathname
		.replaceAll('/', '_')
		.split(base.replace('/', '_'))
		.join('')
		.replace('_', '');
	helpFileName = helpFileName.endsWith('_') ? helpFileName.slice(0, -1) : helpFileName;
	fetch(`https://pyflightcoach.github.io/ScoringInfo/help/${helpFileName || 'home'}.md`)
		.then((response) => (response.ok ? response.text() : undefined))
		.then((text) => help.set(text?.replace('/fcscorebase', base)));
    
}
