

export type Competition="Competition";
export type Stage="Stage";
export type Round="Round";

export type Thing = Competition | Stage | Round;
  

export interface Director {
  id: string;
  name: string;
  country: string;
}

export interface Competitor {
  id: string;
  name: string;
  country: string;
  competitor_id: string;
  name_override: string;
  missed_cut: boolean;
  registration: string | null;
  raw_score: number | null;
  raw_override: number | null;
  flight_order: number | null;
  flight_id: string | null;
  normalised_score: number | null;
  position: number | null;
  score_dropped: boolean;
}

export interface CompetitorCreate {
  comp_id: string;
  user_id: string;
  name_override: string | undefined;
  flight_order: number | undefined;
  registration: string | undefined;
}


export interface ResultRule {
  raw_score: boolean | null;
  normalise_best_to_n: number | null;
  normalise_average_to_n: number | null;
  progress_top_n: number | null;
  use_top_n: number | null;
};


export interface AddRule {
  cd_only: boolean | null;
  cd_and_self_add: boolean | null;
}


export interface FlightRule {
  flown_whilst_open: boolean | null;
  upload_whilst_open: boolean | null;
  upload_within_n_hours: number | null;
  finalised: boolean | null;
}


export interface CompThingSummary {
  id: string;
  name: string;
  comment: string | null;
  index: number;
  what_am_i: Thing;
  date_start: string | null;
  date_end: string | null;
  fa_version: string | null;
  is_open_now: boolean;
  directors: Director[] | null;
  result_rules: ResultRule | null;
  flight_rules: FlightRule | null;
  add_rules: AddRule | null;
  hide_results: boolean;
  competitors: Competitor[] | null;
  children: CompThingSummary[] | null;
}

export interface CompThingCreateUpdate {
  name: string | undefined;
  comment?: string | undefined;
  parent_id?: string | undefined; 
  fa_version?: string | undefined;
  directors?: string[] | undefined;
  result_rules?: ResultRule | undefined;
  flight_rules?: FlightRule | undefined;
  add_rules?: AddRule | undefined;
  hide_results?: boolean | undefined;
}


export interface CompListRequest {
  n_days?: number|undefined;
  date_after? : Date | undefined;
  date_before? : Date | undefined;
  include_competitors? : boolean | undefined;
  i_am_cd? : boolean | undefined;
  i_am_competitor? : boolean | undefined;
  i_can_upload_to? : boolean | undefined;
}