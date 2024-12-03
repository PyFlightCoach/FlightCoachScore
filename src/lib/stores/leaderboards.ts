import { newCookieStore, newCookieStoreInt, newCookieStoreBool } from '$lib/utils/cookieStore';


export const n_days_val = newCookieStoreInt('search_n_days', 30);
export const n_results = newCookieStoreInt('n_results', 1000);
export const me_only_flag = newCookieStoreBool('me_only_flag', false);
export const difficulty = newCookieStoreInt('difficulty', 3);
export const truncate = newCookieStoreBool('truncate', false)
export const schedule_id = newCookieStore('schedule_id', '')
export const one_per_pilot_flag = newCookieStoreBool('one_per_pilot_flag', true)
