import { table_rows } from "$lib/stores/leaderboards";
import { get} from "svelte/store";

export function load({url}) {
  
  const trs = get(table_rows);
  const tr = trs.find(tr => tr.flight_id == url.searchParams.get('flight_id'));
  
  return { flight: tr };
}