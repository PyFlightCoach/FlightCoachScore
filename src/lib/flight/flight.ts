import {Flight as DBFlight} from '$lib/database/flight';
import type { MA } from '$lib/manoeuvre/analysis';
import { Point } from '$lib/utils/geometry';
import { States } from '$lib/utils/state';
import { BinData } from './bin';
import type { Origin } from './fcjson';
import type {Split} from './splitting';


export class FlightDataSource {
  
  constructor(
    readonly file: File | undefined,
    readonly kind: 'bin' | 'acrowrx' | 'fcjson' | undefined,
    readonly db: DBFlight | undefined,
    readonly bootTime: Date | undefined,
    readonly rawData: BinData | States | undefined,
  ) {}

  states(box: Origin) {
    if (this.rawData instanceof BinData) {
      return States.from_xkf1(box, this.rawData.orgn, this.rawData.xkf1);
    } else if (this.rawData instanceof States) {
      return this.rawData;
    }
  }

  shift_z(shiftz: number): FlightDataSource {
    return new FlightDataSource(
      this.file,
      this.kind,
      this.db,
      this.bootTime,
      this.rawData instanceof States ? this.rawData.shift(new Point(0, 0, shiftz)) : this.rawData,
    );
  }

  get description():string {
    if (this.kind==='bin') {
      return this.file ? this.file.name : 'BIN File';
    } else if (this.kind==='acrowrx') {
      return this.file ? this.file.name : "Acrowrx Data";
    } else if (this.db) {
      return `Database Flight`;
    } else {
      return `Unknown Source`;
    }
  }
}

export class Flight {

  constructor(
    readonly source: FlightDataSource,
    readonly origin: Origin | undefined=undefined,
    readonly states: States | undefined=undefined,
    readonly splitting: Split[] | undefined=undefined,
    readonly analyses: MA[] | undefined=undefined,
  ) {}

}