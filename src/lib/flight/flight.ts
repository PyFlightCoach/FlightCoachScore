import { GPS, Point, Quaternion } from '$lib/utils/geometry';
import { States } from '$lib/utils/state';
import type { AJson } from './ajson';
import { BinData } from './bin';
import { Origin } from './fcjson';
import { Splitting } from './splitting';
import { dbServer, analysisServer } from '$lib/api';
import JSZip from 'jszip';
import { blockProgress, unblockProgress } from '$lib/stores/shared';
import type { DBFlightMeta } from '$lib/api/DBInterfaces/flight';
import { compareUUIDs } from '$lib/utils/text';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';


export class BinDataState {
	constructor(
		readonly data: BinData,
		readonly origin: Origin
	) {}

	get states() {
		return States.from_xkf1(this.origin, this.data.orgn, this.data.xkf1);
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
    readonly acroWrxMeta: {flightFileName: string; sequenceFolderName: string} | undefined = undefined
	) {}

	gps() {
		if (this.rawData instanceof BinData) {
			return this.rawData.getGPS();
		} else if (this.rawData instanceof States) {
			const ned_sts = this.rawData.transform(new Point(0, 0, 0), this.origin!.rotation);
			const pilot = this.origin!.pilot;
			return ned_sts.data.map((s) => pilot.offset(s.pos));
		} else {
			throw new Error('Cannot get GPS from this data source');
		}
	}

	get states(): States {
		if (this.rawData instanceof States) {
			return this.rawData;
		} else if (this.rawData instanceof BinData) {
			return States.from_xkf1(this.origin!, this.rawData.orgn, this.rawData.xkf1);
		} else {
			throw new Error('Cannot get States from this data source');
		}
	}

	statesAtNewOrigin(newOrigin: Origin): States {
		const vec = GPS.sub(newOrigin.pilot, this.origin!.pilot);
		const rot = Quaternion.mul(this.origin!.rotation.inverse(), newOrigin.rotation);
		return this.states.transform(vec, rot);
	}

	withNewOrigin(newOrigin: Origin): FlightDataSource {
		return new FlightDataSource(
			this.file,
			this.kind,
			this.db,
			this.bootTime,
			this.rawData instanceof BinData ? this.rawData : this.statesAtNewOrigin(newOrigin),
			newOrigin,
			this.segmentation
		);
	}

	slice(id: number) {
		const { istart, tstart, istop, tstop } = this.segmentation!.sliceInfo(id, this.states.t);
		if (this.rawData instanceof BinData) {
			return new BinDataState(this.rawData.slice(tstart, tstop), this.origin!);
		} else {
			return new GlobalState(this.states!.slice(istart, istop), this.origin!);
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
					res.data as AJson,
					Object.setPrototypeOf(res.data.origin, Origin.prototype)
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
			.then((data: AJson) => {
				return new FlightDataSource(
					undefined,
					'db',
					f,
					data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined,
					data,
					Object.setPrototypeOf(data.origin, Origin.prototype)
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
						this.segmentation
					),
					compthing: res.data.compthing
				};
			})
			.finally(unblockProgress);
	}
}
