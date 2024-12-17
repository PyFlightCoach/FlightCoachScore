import { newCookieStore, newCookieStoreInt, newCookieStoreBool } from '$lib/utils/cookieStore';
import { writable, type Writable } from 'svelte/store';
import { faVersion } from '$lib/api';
import { get } from 'svelte/store';
import { dbServer } from '$lib/api';
import { checkUser } from '$lib/stores/user';
import type { DBFlightRanked, DBFlightScore } from '$lib/database/interfaces';

export const n_results = newCookieStoreInt('n_results', 1000);
export const n_days_val = newCookieStoreInt('search_n_days', 30);
export const me_only_flag = newCookieStoreBool('me_only_flag', false);
export const difficulty = newCookieStoreInt('difficulty', 3);
export const truncate = newCookieStoreBool('truncate', false)
export const schedule_id = newCookieStore('schedule_id', '')
export const one_per_pilot_flag = newCookieStoreBool('one_per_pilot_flag', true)
export const sort_by_score_flag = newCookieStoreBool('sort_by_score_flag', true)
export const singleman = newCookieStoreBool('singleman', false)
export const manoeuvre_ind = newCookieStoreInt('manoeuvre_index', 1)

export const select_by_date = newCookieStoreBool('select_by_date', false)
export const date_after = newCookieStore('date_after', '')
export const date_before = newCookieStore('date_before', '')

export const version = writable(get(faVersion));

export const table_rows: Writable<DBFlightRanked[]> = writable([]);
export const lastResponse: Writable<'leaderboard' | 'flightlist' | undefined> = writable();


export function getDays(ndval: number) {
  return { 0: 1, 370: 720, 380: 10000 }[ndval] || ndval;
}

export const updateTable = async () => {
  const q = {
    ...{
      n_results: get(n_results),
      me_only_flag: get(me_only_flag),
      difficulty: get(difficulty),
      truncate: get(truncate),
      schedule_id: get(schedule_id),
      one_per_pilot_flag: get(sort_by_score_flag) ? get(one_per_pilot_flag) : false,
      version: get(version)
    },
    ...(get(singleman) ? { manoeuvre_ind: get(manoeuvre_ind) } : {}),
    ...(get(sort_by_score_flag) ? { sort_by_score_flag: get(sort_by_score_flag) } : {}),
    ...(get(select_by_date) ? { date_after: get(date_after), date_before: get(date_before) } : { n_days: getDays(get(n_days_val)) })
  };
  console.debug(q);
  const _method = get(sort_by_score_flag) ? 'leaderboard' : 'flightlist';
  if (await checkUser()) {
    
    dbServer.get('analysis/' + _method + '?' + new URLSearchParams(q).toString()).then((res) => {
      table_rows.set(res.data.results.map((row: DBFlightRanked | DBFlightScore) => {
        return { ...row, score: Math.round(row.score * 100) / 100 };
      }));
    });
    lastResponse.set(_method);
  }
}


