

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
  comment: string | null;
  index: number | null;
  what_am_i: ["competition", "stage", "round"];
  date_start: string | null;
  date_end: string | null;
  fa_version: string | null;
  is_open_now: boolean;
  directors: Director[] | null;
  result_rules: ResultRule | null;
  add_rules: AddRule | null;
  hide_results: boolean;
  competitors: Competitor[] | null;
  children: CompThingSummary[] | null;
}


export interface CompThingCreateUpdate {
  name: string | null;
  comment?: string | null;
  parent_id?: string | null; 
  fa_version?: string | null;
  directors?: string[] | null;
  result_rules?: ResultRule | null;
  flight_rules?: FlightRule | null;
  add_rules?: AddRule | null;
  hide_results?: boolean | null;
}
