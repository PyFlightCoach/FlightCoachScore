import { type Writable, writable } from "svelte/store";
import { dbServer } from "$lib/api";
import {user} from "$lib/stores/user";
import { library } from "$lib/schedules";

export interface UserActivityResponse {
  id: string;
  name: string;
  country: string;
  top_schedule_id: string;
  top_schedule_n: number;
  best_rank_schedule_id: string;
  best_rank: number;
  best_norm_rank_schedule_id: string;
  best_norm_rank: number;
  total_n: number;
}

export const userActivity: Writable<UserActivityResponse[]> = writable([]);

export const request_activity = () => {
  dbServer
    .get('/analysis/user_activity')
    .then((res) => {
      userActivity.set(res.data.results as UserActivityResponse[]);
    })
    .catch((err) => {
      console.log(err);
    });
};

user.subscribe(request_activity);
library.subscribe(request_activity);