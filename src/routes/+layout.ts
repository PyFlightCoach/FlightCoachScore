export const prerender = true;
export const ssr = false;
import {dev as envDev} from '$app/environment';
import {dev} from '$lib/stores/shared';

export function load() {
  dev.set(envDev);
}