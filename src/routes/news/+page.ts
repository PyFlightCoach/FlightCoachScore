import { dbServer } from "$lib/api.js";

export async function load({url}) {
  
  const res = await dbServer.get('news');

  return { news: res.results };
}