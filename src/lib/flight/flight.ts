import { DBFlight } from '$lib/database/flight';
import { GPS, Point } from '$lib/utils/geometry';
import { States } from '$lib/utils/state';
import type { AJson } from './ajson';
import { BinData } from './bin';
import { Origin } from './fcjson';
import { Splitting, type Split } from './splitting';
import { dbServer, analysisServer } from '$lib/api';
import JSZip from 'jszip';
import { blockProgress, unblockProgress } from '$lib/stores/shared';


export class BinDataState {
	constructor(
		readonly data: BinData,
		readonly origin: Origin
	) {}


  states() {
    return States.from_xkf1(this.origin, this.data.orgn, this.data.xkf1);
  }
}

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
		const ned_sts = this.states.transform(new Point(0, 0, 0), this.origin.rotation);
		const pilot = this.origin.pilot;
		return ned_sts.data.map((s) => pilot.offset(s.pos));
	}
}

export class FlightDataSource {
	constructor(
		readonly file: File | undefined,
		readonly kind: 'bin' | 'acrowrx' | 'example' | 'db' | 'ajson',
		readonly db: DBFlight | undefined = undefined,
		readonly bootTime: Date | undefined = undefined,
		readonly rawData: BinData | GlobalState | AJson | undefined = undefined
	) {}

	gps() {
		if (this.rawData instanceof BinData) {
			return this.rawData.getGPS();
		} else if (this.rawData instanceof GlobalState) {
			return this.rawData.gps();
		} else {
			throw new Error('Cannot get GPS from this data source');
		}
	}

	states(box: Origin) {
		if (this.rawData instanceof BinData) {
			return States.from_xkf1(box, this.rawData.orgn, this.rawData.xkf1);
		} else if (this.rawData instanceof GlobalState) {
			if (this.rawData.origin.heading != box.heading) {
				throw new Error('Cannot change origin heading');
			}
			return this.rawData.move(GPS.sub(box.pilot, this.rawData.origin.pilot)).states;
		} else {
			throw new Error('Cannot get States from this data source');
		}
	}

	static async example() {
		return analysisServer
			.get('example', blockProgress('Downloading Example'))
			.then((res) => {
				return new FlightDataSource(
					undefined,
					'example',
					undefined,
					new Date(Date.parse(res.data.bootTime)),
					res.data as AJson
				);
			})
			.finally(unblockProgress);
	}

	static async db(flight: DBFlight | string) {
		const zip = new JSZip();
		flight = flight instanceof DBFlight ? flight : await DBFlight.load(flight);

		return dbServer
			.get(`flight/ajson/${flight instanceof DBFlight ? flight.meta.flight_id : flight}`, {
				responseType: 'blob',
				...blockProgress('Loading Analysis from Database')
			})
			.then((response) => zip.loadAsync(response.data))
			.then((res) => Object.values(res.files)[0].async('string'))
			.then((ajson) => JSON.parse(ajson))
			.then((data: AJson) => {
				return new FlightDataSource(
					undefined,
					'db',
					flight,
					data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined,
					data
				);
			})
			.finally(unblockProgress);
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
      case 'ajson':
        return 'AJSON Data';
			default:
				throw new Error(`Unknown flight data source ${this.kind}`);
		}
	}
}

export class Flight {
	constructor(
		readonly source: FlightDataSource,
		readonly origin: Origin | undefined = undefined,
		readonly states: States | undefined = undefined,
		readonly segments: Split[] | undefined = undefined
	) {}

	get segmentation(): Splitting | undefined {
		return new Splitting(this.segments || []);
	}

	sliceInfo(id: number) {
		const istart = id > 0 ? this.segments![id - 1].stop! : 0;
		const tstart = this.states!.data[istart].t;
		const istop = this.segments![id].stop!;
		const tstop = this.states!.data[istop].t;
		return { istart, tstart, istop, tstop };
	}

	slice(id: number) {
		const { istart, tstart, istop, tstop } = this.sliceInfo(id);
		if (this.source.rawData instanceof BinData) {
			return new BinDataState(this.source.rawData.slice(tstart, tstop), this.origin!);
		} else {
			return this.states!.slice(istart, istop);
		}
	}

	static async example() {
		return FlightDataSource.example().then((source) => {
			return new Flight(
				source,
				Object.setPrototypeOf((source.rawData as AJson).origin, Origin.prototype)
			);
		});
	}

	static async download(flight: DBFlight | string): Promise<Flight> {
		return FlightDataSource.db(flight).then((fds) => {
			const data = fds.rawData as AJson;
			return new Flight(fds, Object.setPrototypeOf(data.origin, Origin.prototype));
		});
	}

	async upload(
		ajson: AJson | undefined = undefined,
		privacy: string | undefined = undefined,
		comment: string | undefined = undefined,
		userID: string | undefined = undefined,
		roundID: string | undefined = undefined
	) {
		const form_data = new FormData();

		if (ajson) {
			form_data.append(
				'files',
				new File(
					[
						new Blob([JSON.stringify(ajson, null, 2)], {
							type: 'application/octet-stream'
						})
					],
					'analysis.ajson',
					{ type: 'application/octet-stream' }
				)
			);
		} else {
			if (!this.source.db) {
				throw new Error('Cant post flight without ajson');
			}
		}

		if (comment) form_data.append('comment', comment);
		if (privacy) form_data.append('privacy', privacy);
		if (!this.source.db) {
			form_data.append('files', this.source.file!);
		}

		let route;
		if (this.source.db) {
			route = `flight/${this.source.db.meta.flight_id}`;
		} else if (roundID && userID) {
			route = `flight/competition/${roundID}/${userID}`;
		} else if (userID) {
			route = `flight/${userID}`;
		} else {
			route = `flight`;
		}

		return (this.source.db ? dbServer.patch : dbServer.post)(
			route,
			form_data,
			blockProgress('Uploading Analysis to Database', 'upload')
		).then(async (res) => {
			return {
				flight: new Flight(
					new FlightDataSource(
						undefined,
						'db',
						await DBFlight.load(res.data.meta),
						this.source.bootTime,
						ajson
					),
					this.origin,
					this.states,
					this.segments
				),
				compthing: res.data.compthing
			};
		})
    .finally(unblockProgress);
	}
}
