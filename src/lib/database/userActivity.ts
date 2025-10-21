import { dbServer } from "$lib/api/api";


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

export async function loadActivity() {
  return dbServer
    .get('/analysis/user_activity')
    .then((res) => {
      return res.data.results as UserActivityResponse[];
    });
};

