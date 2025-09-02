

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
  registration: string | undefined;
  raw_score: number;
  raw_override: number;
  flight_order: number;
  flight_id: string;
  normalised_score: number;
  position: number;
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
  raw_score?: boolean;
  normalise_best_to_n?: number;
  normalise_average_to_n?: number;
  progress_top_n?: number;
  use_top_n?: number;
};


export interface AddRule {
  cd_only?: boolean;
  cd_and_self_add?: boolean;
}


export interface FlightRule {
  flown_whilst_open?: boolean;
  upload_whilst_open?: boolean;
  upload_within_n_hours?: number;
  finalised?: boolean;
}


export interface CompThingSummary {
  id: string;
  name: string;
  comment: string | undefined;
  index: number | undefined;
  what_am_i: Thing;
  date_start: string | undefined;
  date_end: string | undefined;
  fa_version: string | undefined;
  is_open_now: boolean;
  directors: Director[] | undefined;
  result_rules: ResultRule | undefined;
  flight_rules?: FlightRule | undefined;
  add_rules: AddRule | undefined;
  hide_results: boolean;
  competitors: Competitor[] | undefined;
  children: CompThingSummary[] | undefined;
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