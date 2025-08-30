

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
  raw_score: number;
  raw_override: number;
  flight_order: number;
  flight_id: string;
  normalised_score: number;
  position: number;
  score_dropped: boolean;
}

export interface ResultRule {
  raw_score?: boolean;
  normalise_best_to_n?: number;
  normalise_average_to_n?: number;
  progress_top_n?: number;
  use_top_n?: number;
};
export function newResultRule(): ResultRule {
  return {
    normalise_best_to_n: 1000,
  };
}

export interface AddRule {
  cd_only?: boolean;
  cd_and_self_add?: boolean;
}
export function newAddRule(): AddRule {
  return {
    cd_only: true,
    cd_and_self_add: false
  };
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
  add_rules: AddRule | undefined;
  hide_results: boolean;
  flight_rules?: FlightRule | undefined;
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


export function competitionPostData(
  name: string,
  comment: string | undefined = undefined,
  fa_version: string | undefined = undefined,
  add_rules: AddRule | undefined = undefined,
  result_rules: ResultRule | undefined = undefined,
) {
  return {
    name,
    comment,
    fa_version,
    add_rules,
    result_rules
  } as CompThingCreateUpdate;
}