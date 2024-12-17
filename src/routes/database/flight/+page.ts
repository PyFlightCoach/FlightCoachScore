import { dbServer } from "$lib/api.js";
import {Flight} from '$lib/database/flight';
import {States} from '$lib/analysis/state';

export async function load({url}) {
  
  const flight_id = url.searchParams.get('flight_id');
  if (!flight_id) {
    return { status: 404, error: new Error("Flight ID not found") };
  }
  const flight = await Flight.load(flight_id);
  const mans = (await dbServer.get(`flight/view/${flight_id}`)).data.mans.map(v=>States.parse(v.flown));


  return { flight: flight, mans: mans };
}