import { newCookieStore, newCookieStoreInt, newCookieStoreBool } from '$lib/utils/cookieStore';

export const n_results = newCookieStoreInt('n_results', 1000);
export const n_days_val = newCookieStoreInt('search_n_days', 30);
export const me_only_flag = newCookieStoreBool('me_only_flag', false);
export const difficulty = newCookieStoreInt('difficulty', 3);
export const truncate = newCookieStoreBool('truncate', false)
export const schedule_id = newCookieStore('schedule_id', '')
export const one_per_pilot_flag = newCookieStoreBool('one_per_pilot_flag', true)
export const sort_by_score_flag = newCookieStoreBool('sort_by_score_flag', true)

export const select_by_date = newCookieStoreBool('select_by_date', false)
export const date_after = newCookieStore('date_after', '')
export const date_before = newCookieStore('date_before', '')