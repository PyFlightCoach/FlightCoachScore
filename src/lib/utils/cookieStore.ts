import { browser } from '$app/environment';
import { writable } from 'svelte/store';


export function newCookieStore(name: string, value: string, subscribe: ((value: string) => void) | undefined=undefined) {
  const store = writable(
    browser ? localStorage.getItem(name) || value : value
  );
  store.subscribe(val => {
    if (browser) localStorage.setItem(name, val);
    if (subscribe) subscribe(val);
  });
  return store;
}