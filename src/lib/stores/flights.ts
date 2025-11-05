
import type { FlightDataSource } from "$lib/flight/flight";
import {type Writable, writable, derived, type Readable, get } from "svelte/store";
import { dev } from "./shared";

export const flightLimit: Readable<number> = derived(dev, (d)=>d ? 5 : 2)

export const flights: Writable<FlightDataSource[]> = writable([]);


