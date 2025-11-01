import {Flight as DBFlight} from '$lib/database/flight';
import type { Origin } from './fcjson';
import type {Split} from './splitting';


export class FlightDataSource {
  
  constructor(
    readonly file: File | undefined,
    readonly kind: 'bin' | 'acrowrx' | 'fcjson' | undefined,
    readonly db: DBFlight | undefined,
    readonly bootTime: Date | undefined,
  ) {}
}

export class Box {
  constructor(
    readonly origin: Origin,
  ) {}
}


export class Flight {

  constructor(
    readonly source: FlightDataSource,
    readonly box: Box,
    readonly splitting: Split[]
  ) {}
}