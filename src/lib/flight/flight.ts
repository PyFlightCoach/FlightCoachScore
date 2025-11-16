import { GPS, Point, Quaternion } from '$lib/utils/geometry';
import { States } from '$lib/utils/state';
import type { AJMan, AJson } from './ajson';
import { BinData } from './bin';
import { Origin } from './fcjson';
import { Splitting, ManSplit } from './splitting';
import { dbServer, analysisServer } from '$lib/api';
import JSZip from 'jszip';
import { blockProgress, faVersion, unblockProgress } from '$lib/stores/shared';
import type { DBFlightMeta } from '$lib/api/DBInterfaces/flight';
import { compareUUIDs, prettyDate } from '$lib/utils/text';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';
import type { DBSchedule } from '$lib/schedule/db';
import { objfilter } from '$lib/utils/arrays';

export class BinDataState {
	constructor(
		readonly data: BinData,
		readonly origin: Origin
	) {}

	get states() {
		return States.from_binData(this.origin, this.data);
	}
}

export class GlobalState {
	constructor(
		readonly states: States,
		readonly origin: Origin
	) {}

	get data() {
		return this.states.data;
	}
}

export class FlightDataSource {
	constructor(
		readonly file: File | undefined,
		readonly kind: 'bin' | 'acrowrx' | 'example' | 'db' | 'ajson',
		readonly db: DBFlightMeta | undefined = undefined,
		readonly bootTime: Date | undefined = undefined,
		readonly rawData: BinData | States | AJson | undefined = undefined,
		readonly origin: Origin | undefined = undefined,
		readonly segmentation: Splitting | undefined = undefined,
		readonly schedule: DBSchedule | undefined = undefined,
		readonly acroWrxMeta:
			| { flightFileName: string; sequenceFolderName: string }
			| undefined = undefined,
		readonly history: Record<string, unknown>[] = [],
    readonly updated: boolean = false
	) {}

	get states(): States {
		if (this.rawData instanceof States) {
			return this.rawData;
		} else if (this.rawData instanceof BinData) {
			return States.from_binData(this.origin!, this.rawData);
		} else {
			return States.stack(this.rawData!.mans.map((m) => States.parse(m.flown)));
		}
	}

	checkOriginElevation(newOrigin: Origin | undefined, tol: number = 10): boolean {
		if (this.rawData! instanceof BinData) {
			const origin = this.rawData!.findOrigin();
			return Math.abs((newOrigin || this.origin!).alt - origin.alt) < tol;
		}
		return true;
	}

	statesAtNewOrigin(newOrigin: Origin): States {
		const vec = GPS.sub(this.origin!.pilot, newOrigin.pilot);
		const rot = Quaternion.mul(newOrigin.rotation.inverse(), this.origin!.rotation);
		return this.states.transform(vec, rot);
	}

	gps() {
		const ned_sts = this.states.transform(new Point(0, 0, 0), this.origin!.rotation);
		const pilot = this.origin!.pilot;
		return ned_sts.data.map((s) => pilot.offset(s.pos));
	}

	withNewOrigin(newOrigin: Origin): FlightDataSource {
    if (!Origin.equals(this.origin, newOrigin)) {
        return Object.assign(this, {
        rawData: this.rawData instanceof BinData ? this.rawData : this.statesAtNewOrigin(newOrigin),
        origin: newOrigin,
        history: this.history?.map((m) => objfilter(m, (k) => k != get(faVersion))),
        updated: true
      });
    } else {
      return this;
    }		
	}

	withNewSegmentation(newSegmentation: Splitting): FlightDataSource {
		const updatedHistory = newSegmentation.mans.slice(1, -1).map((m, i) => {
			if (
				(this.segmentation && i >= this.segmentation.mans.length) ||
				ManSplit.equals(m, this.segmentation!.mans[i + 1]) ||
				!this.history[i]
			) {
				return this.history[i];
			} else {
				return objfilter(this.history[i], (k) => k != get(faVersion));
			}
		});

		return Object.assign(this, {
			segmentation: newSegmentation,
			schedule: newSegmentation.schedule,
			rawData: this.rawData instanceof BinData ? this.rawData : this.states,
			history: updatedHistory,
      updated: true
		});
	}

	slice(id: number) {
		const { istart, tstart, istop, tstop } = this.segmentation!.sliceInfo(id, this.states.t);
		if (this.rawData instanceof BinData) {
			return new BinDataState(this.rawData.slice(tstart, tstop), this.origin!);
		} else {
			let states: States = this.states!.slice(istart, istop);
			const elements = states.element;
			if (elements[0] != 'entry_line' || elements[elements.length - 1] != 'exit_line') {
				states = states.removeLabels();
			}

			return new GlobalState(states, this.origin!);
		}
	}

	static async example() {
		return analysisServer
			.get('example', blockProgress('Downloading Example'))
			.then(async (res) => {
				const splitting = await Splitting.parseAJson(res.data);
				return new FlightDataSource(
					undefined,
					'example',
					undefined,
					new Date(Date.parse(res.data.bootTime)),
					res.data as AJson,
					Object.setPrototypeOf(res.data.origin, Origin.prototype),
					splitting,
					splitting.schedule,
					undefined,
					res.data.mans.map((m: AJMan) => m.history || {})
				);
			})
			.finally(unblockProgress);
	}

	get isMine() {
		return this.db ? compareUUIDs(get(user)!.id, this.db.pilot_id) : !!this.file;
	}

	static async db(f: DBFlightMeta | string) {
		if (typeof f === 'string') {
			f = (await dbServer.get(`flight/${f}`)).data as DBFlightMeta;
		}

		const zip = new JSZip();

		return dbServer
			.get(`flight/ajson/${f.flight_id}`, {
				responseType: 'blob',
				...blockProgress('Loading Analysis from Database')
			})
			.then((response) => zip.loadAsync(response.data))
			.then((res) => Object.values(res.files)[0].async('string'))
			.then((ajson) => JSON.parse(ajson))
			.then(async (data: AJson) => {
				const segmentation = await Splitting.parseAJson(data);
				return new FlightDataSource(
					undefined,
					'db',
					f,
					data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined,
					data,
					Object.setPrototypeOf(data.origin, Origin.prototype),
					segmentation,
					segmentation.schedule,
					undefined,
					data.mans.map((m) => m.history || {})
				);
			})
			.finally(unblockProgress);
	}

	get sourceDescription(): string {
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

	get description(): string | undefined {
		return prettyDate(this.bootTime);
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
			if (!this.db) {
				throw new Error('Cant post flight without ajson');
			}
		}

		if (comment) form_data.append('comment', comment);
		if (privacy) form_data.append('privacy', privacy);
		if (this.file && !this.db) {
			form_data.append('files', this.file!);
		}

		let route;
		if (this.db) {
			route = `flight/${this.db.flight_id}`;
		} else if (roundID && userID) {
			route = `flight/competition/${roundID}/${userID}`;
		} else if (userID) {
			route = `flight/${userID}`;
		} else {
			route = `flight`;
		}

		return (this.db ? dbServer.patch : dbServer.post)(route, form_data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			...blockProgress('Uploading Analysis to Database', 'upload')
		})
			.then(async (res) => {
				return {
					flight: new FlightDataSource(
						undefined,
						'db',
						res.data.meta,
						this.bootTime,
						ajson,
						this.origin,
						this.segmentation,
						this.schedule,
						this.acroWrxMeta,
						this.history
					),
					compthing: res.data.compthing
				};
			})
			.finally(unblockProgress);
	}
}
