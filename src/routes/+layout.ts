export const prerender = true;
export const ssr = false;
export const trailingSlash = 'always'

import { dev as envDev } from '$app/environment';
import { dev } from '$lib/stores/shared';



export function load() {
	dev.set(envDev);
}
