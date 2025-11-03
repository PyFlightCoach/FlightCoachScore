import { DBFlight } from '$lib/database/flight';
import { GPS, Point, Quaternion } from '$lib/utils/geometry';
import { States } from '$lib/utils/state';
import { BinData } from './bin';
import { Origin } from './fcjson';
import type { Split } from './splitting';

export class GlobalState {
	constructor(
		readonly origin: Origin,
		readonly bootTime: Date,
		readonly states: States
	) {}

	move(vector: Point): GlobalState {
		const pos = new GPS(this.origin.lat, this.origin.lng, this.origin.alt).offset(vector);

		return new GlobalState(
			new Origin(pos.lat, pos.lon, pos.alt, this.origin.heading),
			this.bootTime,
			this.states.shift(vector)
		);
	}

  gps() {
    const ned_sts = this.states.transform(new Point(0,0,0), this.origin.rotation);
    const pilot = this.origin.pilot;
    return ned_sts.data.map(s=>pilot.offset(s.pos));
  }
}

export class FlightDataSource {
	constructor(
		readonly file: File | undefined,
		readonly kind: 'bin' | 'acrowrx' | 'example' | 'db',
		readonly db: DBFlight | undefined,
		readonly bootTime: Date | undefined,
		readonly rawData: BinData | GlobalState | undefined
	) {}

  gps() {
    if (this.rawData instanceof BinData) {
      return this.rawData.getGPS();
    } else if (this.rawData instanceof GlobalState) {
      return this.rawData.gps();
    }
    return [];
  }

	states(box: Origin) {
		if (this.rawData instanceof BinData) {
			return States.from_xkf1(box, this.rawData.orgn, this.rawData.xkf1);
		} else if (this.rawData instanceof GlobalState) {
    
      if (this.rawData.origin.heading != box.heading) {
        throw new Error('Cannot change origin heading');
      }
			return this.rawData.move(GPS.sub(box.pilot, this.rawData.origin.pilot)).states;
		}
	}

	get description(): string {
    switch (this.kind) {
      case 'example':
        return 'Example Flight';
      case 'db':
        return 'Database Flight';
      case 'acrowrx':
        return this.file ? this.file.name : 'Acrowrx Data';
      case 'bin':
        return this.file ? this.file.name : 'BIN File';
    }
	}
}

export class Flight {
	constructor(
		readonly source: FlightDataSource,
		readonly origin: Origin | undefined = undefined,
		readonly states: States | undefined = undefined,
		readonly splitting: Split[] | undefined = undefined
	) {}
}
