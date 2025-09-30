import { type Writable, writable } from "svelte/store";
import { dbServer } from "$lib/api/api";
import {get} from "svelte/store";


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

export const userActivity: Writable<UserActivityResponse[] | undefined> = writable();
let loadingActivity: boolean = false;

export async function requestActivity() {
  if (!get(userActivity) && !loadingActivity) {
    loadingActivity = true;
    await dbServer
    .get('/analysis/user_activity')
    .then((res) => {
      console.log("User activity loaded");
      userActivity.set(res.data.results as UserActivityResponse[]);
    })
    .catch((err) => {
      userActivity.set([]);
      console.error("Failed to load user activity:", err);
    })
    .finally(() => {
      loadingActivity = false;
    });
  }
  
};

export async function clearActivity() {
  userActivity.set([]);
};