import { newCookieStore, newCookieStoreInt, newCookieStoreBool } from '$lib/utils/cookieStore';
import { writable, type Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { dbServer } from '$lib/api/api';
import { checkUser } from '$lib/stores/user';
import * as types from '$lib/api/DBInterfaces/flight';
import { activeFlight, faVersion } from '$lib/stores/shared';
import { library } from '$lib/schedule/library';

export const n_results = newCookieStoreInt('n_results', 10);
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

export const includeMyBest = newCookieStoreInt('includeMyBest', 0);
export const includeMyLatest = newCookieStoreInt('includeMyLatest', 0);
export const includeActive = newCookieStoreInt('includeActive', 0);

export const table_rows: Writable<types.DBFlightRanked[]> = writable([]);
export const lastResponse: Writable<'leaderboard' | 'flightlist' | undefined> = writable();

export function getDays(ndval: number) {
  return { 0: 1, 370: 720, 380: 10000 }[ndval] || ndval;
}

export function getNFlights(nfval: number) {
  return { 101: 200, 102: 1000 }[nfval] || nfval;
}

export const postUploadSearch = () => {
  const fl = get(activeFlight)!;

  select_by_date.set(true);
  const dbefore = fl!.bootTime!;
  dbefore.setDate(dbefore.getDate() + 1);
  date_before.set(dbefore.toISOString().split('T')[0]);
  const dafter = fl!.bootTime!;
  dafter.setDate(dafter.getDate() - 30);
  date_after.set(dafter.toISOString().split('T')[0]);
  //n_days_val.set(30);
  schedule_id.set(fl!.db?.schedule_id || '');
  sort_by_score_flag.set(false);
  version.set(get(faVersion)!);
  n_results.set(20);
  //includeActive.set(3);
  updateTable();
}

library.subscribe((lib)=>{
  if (!get(schedule_id)) {schedule_id.set(lib?.first?.schedule_id || '')}
})

export const updateTable = async () => {
  if (await checkUser()) {
    const q = {
      ...{
        n_results: getNFlights(get(n_results)),
        me_only_flag: get(me_only_flag),
        difficulty: get(difficulty),
        truncate: get(truncate),
        schedule_id: get(schedule_id),
        one_per_pilot_flag: get(sort_by_score_flag) ? get(one_per_pilot_flag) : false,
        version: get(version)
      },
      ...(get(singleman) ? { manoeuvre_ind: get(manoeuvre_ind) } : {}),
      ...(get(sort_by_score_flag) && get(includeMyBest) ? { include_my_best: get(includeMyBest)-1 } : {}),
      ...(get(sort_by_score_flag) && get(includeMyLatest) ? { include_my_latest: get(includeMyLatest)-1 } : {}),
      ...(get(sort_by_score_flag) && get(includeActive) && get(activeFlight)?.isMine ? { include_my_flight_id: `${get(activeFlight)?.meta.flight_id}+${get(includeActive)-1}` } : {}),
      ...(get(select_by_date) ? { date_after: get(date_after), date_before: get(date_before) } : { n_days: getDays(get(n_days_val)) })
    };

    const _method = get(sort_by_score_flag) ? 'leaderboard' : 'flightlist';
    
    dbServer.get(`analysis/${_method}`, {params:q}).then((res) => {
      table_rows.set(res.data.results.map((row: types.DBFlightRanked | types.DBFlightScore) => {
        return { ...row, score: Math.round(row.score * 100) / 100 };
      }));
    }).catch((e) => {console.error(e);});
    lastResponse.set(_method);
  }
}


