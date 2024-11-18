import { dbServer } from "$lib/api";


export async function get_analysis_table(formdata: FormData) {
  const query = [...formdata.entries()];
  const query_str = query
      .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
      .join('&');

  const res = await dbServer.get('analysis/leaderboard?' + query_str);
  let raw_rows = res.results;

  // Round score to 1 decimal place
  for (const r in raw_rows)
      raw_rows[r].score = Math.round(parseFloat(raw_rows[r].score) * 10) / 10;
  return raw_rows;
}