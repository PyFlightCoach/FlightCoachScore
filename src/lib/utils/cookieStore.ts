import { browser } from '$app/environment';
import { writable } from 'svelte/store';


export function newCookieStore(
  name: string, value: string, 
  subscribe: ((value: string) => void) | undefined=undefined
) {
  const store = writable(
    browser ? localStorage.getItem(name) || value : value
  );
  store.subscribe(val => {
    if (browser) localStorage.setItem(name, val);
    if (subscribe) subscribe(val);
  });
  return store;
}


export function newCookieStoreInt(
  name: string, value: number, 
  subscribe: ((value: number) => void) | undefined=undefined
) {

  const getVal = () => {
    return browser ? parseInt(localStorage.getItem(name) || value.toFixed(0)) : value;
  }

  const store = writable(browser ? getVal() : value);

  store.subscribe(val => {
    if (browser) localStorage.setItem(name, val.toFixed(0));
    if (subscribe) subscribe(val);
  });
  return store;
}

export function newCookieStoreBool(
  name: string, value: boolean, 
  subscribe: ((value: boolean) => void) | undefined=undefined
) {

  const getVal = () => {
    return browser ? (localStorage.getItem(name) || value.toString()) == 'true' : value;
  }

  const store = writable(browser ? getVal() : value);

  store.subscribe(val => {
    if (browser) localStorage.setItem(name, val.toString());
    if (subscribe) subscribe(val);
  });
  return store;
}