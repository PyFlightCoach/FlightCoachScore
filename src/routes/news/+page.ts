import { dbServer } from "$lib/api/api.js";

export async function load({url}) {
  
  const res = await dbServer.get('news');

  return { news: res.data.results };
}