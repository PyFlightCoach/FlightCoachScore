import { GPS } from '$lib/analysis/geometry';
import type { DBSchedule, DBFlightRanked } from '$lib/interfaces';


export class DBFlightStack {
	flights: DBFlightRanked[] = [];
	constructor(readonly loc: GPS) {}

	static build(flight: DBFlightRanked) {
		const dbf = new DBFlightStack(new GPS(flight.origin_lat, flight.origin_lng, 0));
		dbf.add(flight);
		return dbf;
	}

	checkAddFlight(flight: DBFlightRanked, tolerance: number) {
		if (GPS.sub(new GPS(flight.origin_lat, flight.origin_lng, 0), this.loc).length() < tolerance) {
			this.add(flight);
			return true;
		} else {
			return false;
		}
	}

	add(flight: DBFlightRanked) {
		this.flights.push(flight);
	}

  get info() {
    const best_pilot = this.bestFlight.name;
    return Object.entries({
      maxScore: this.maxScore,
      nFlights: this.nFlights,
      nPilots: this.pilots.length,
      pilots: '<br>' + this.pilots.map(v=>v==best_pilot ? `${v}*` : v ).join(',<br>'),
    }).map(([k, v]) => `${k}: ${v}`).join('<br>');
  }

  get origin_lat() {
    return this.loc.lat;
  }
  get origin_lng() {
    return this.loc.lon;
  }

  get minScore() {
    return Math.min(...this.flights.map((f) => f.score));
  }
  get maxScore() {
    return Math.max(...this.flights.map((f) => f.score));
  }
  get bestFlight() {
    return this.flights.reduce((a, b) => (a.score > b.score ? a : b));
  }
  get worstFlight() {
    return this.flights.reduce((a, b) => (a.score < b.score ? a : b));
  }
  get avgScore() {
    return this.flights.reduce((a, b) => a.score + b.score, 0) / this.flights.length;
  }
  get nFlights() {
    return this.flights.length;
  }
  get pilots() {
    return Array.from(new Set(this.flights.map((f) => f.name)));
  }
}


export function stackFlights(trs: DBFlightRanked[], tolerance: number) {
	const stacks: DBFlightStack[] = [];
	trs.forEach((tr) => {
		let added = false;
		for (const st of stacks) {
			if (st.checkAddFlight(tr, tolerance)) {
				added = true;
				break;
			}
		}
		if (!added) {
			stacks.push(DBFlightStack.build(tr));
		}
	});
	return stacks;
}


export function scheduleRepr(s: DBSchedule | undefined): string {
  return s ? `${s.category_name} ${s.schedule_name}`.toUpperCase() : ''
}