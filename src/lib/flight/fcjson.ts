import { browser } from '$app/environment';
import { GPS, Quaternion, Point } from '$lib/utils/geometry';
import { analysisServer } from '$lib/api/api';
import _ from 'lodash';

export class Origin {
	lat: number;
	lng: number;
	alt: number;
	heading: number;
	move_east: number;
	move_north: number;
	constructor(
		lat: number,
		lng: number,
		alt: number,
		heading: number,
		move_east: number = 0,
		move_north: number = 0
	) {
		this.lat = lat;
		this.lng = lng;
		this.alt = alt;
		this.heading = heading;
		this.move_east = move_east;
		this.move_north = move_north;
	}

	save() {
		localStorage.setItem('orginLat', this.lat.toFixed(10));
		localStorage.setItem('orginLon', this.lng.toFixed(10));
		localStorage.setItem('orginAlt', this.alt.toFixed(10));
		localStorage.setItem('orginHead', this.heading.toFixed(10));
	}

	static load() {
		if (
			browser &&
			['orginLat', 'orginLon', 'orginAlt', 'orginHead']
				.map((key) => localStorage.getItem(key))
				.every((v) => v)
		) {
			return new Origin(
				parseFloat(localStorage.getItem('orginLat') || '0'),
				parseFloat(localStorage.getItem('orginLon') || '0'),
				parseFloat(localStorage.getItem('orginAlt') || '0'),
				parseFloat(localStorage.getItem('orginHead') || '0')
			);
		} else {
			return undefined;
		}
	}

	get radHeading() {
		return (this.heading * Math.PI) / 180;
	}

	get pilot() {
		return new GPS(this.lat, this.lng, this.alt);
	}

  get centre() {
    return this.pilot.offset(this.rotation.transform_point(new Point(0, 100, 0)));
  }

	get rotation() {
		return Quaternion.parse_euler(new Point(Math.PI, 0, this.radHeading + Math.PI / 2));
	}
	noMove() {
		return new Origin(this.lat, this.lng, this.alt, this.heading);
	}

	static from_centre(pil: GPS, centre: GPS) {
		const vec = GPS.sub(centre, pil);
		return new Origin(pil.lat, pil.lon, pil.alt, (Math.atan2(vec.y, vec.x) * 180) / Math.PI, 0, 0);
	}

	get_box_loc(lat: number, lng: number, alt: number) {
		const rot = Quaternion.parse_euler(
			new Point(Math.PI, 0, (this.heading * Math.PI) / 180 + Math.PI / 2)
		);
		const pned = GPS.sub(new GPS(lat, lng, alt), new GPS(this.lat, this.lng, this.alt));
		return rot.transform_point(new Point(pned.y, pned.x, -pned.z));
	}

	static parseF3aZone(contents: string) {
		if (contents.startsWith('Emailed box data for F3A Zone Pro')) {
			const data = contents.split('\n');
			return Origin.from_centre(
				new GPS(parseFloat(data[2]), parseFloat(data[3]), parseFloat(data[6])),
				new GPS(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]))
			);
		}
	}

	static parseString(contents: string) {
		if (contents.startsWith('Emailed box data for F3A Zone Pro')) {
			const data = contents.split('\n');

			return Origin.from_centre(
				new GPS(parseFloat(data[2]), parseFloat(data[3]), parseFloat(data[6])),
				new GPS(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]))
			);
		} else {
			return FCJson.parse(JSON.parse(contents)).origin;
		}
	}
}

export class ScheduleInfo {
	constructor(
		readonly category: string,
		readonly name: string
	) {}

	static from_fcj_sch(sch: string[]): ScheduleInfo {
		return new ScheduleInfo(sch[0], sch[1]);
	}

	async to_pfc() {
		return await analysisServer.post('/convert_schedule_info', this).then((sinfo) => {
			return Object.setPrototypeOf(sinfo.data, ScheduleInfo.prototype) as ScheduleInfo;
		});
	}

	to_string() {
		return `${this.category}_${this.name}`;
	}

	async direction_definition() {
		return (await analysisServer.get(`/${this.category}/${this.name}/direction_definition`)).data;
	}
}

export class FCJMan {
	k: number;
	constructor(
		readonly name: string,
		k: number,
		readonly id: string,
		readonly sp: number,
		readonly wd: number,
		readonly start: number,
		readonly stop: number,
		readonly sel: boolean,
		readonly background: string
	) {
		this.k = k;
	}
}

export class FCJData {
	constructor(
		readonly VN: number,
		readonly VE: number,
		readonly VD: number,
		readonly dPD: number,
		readonly r: number,
		readonly p: number,
		readonly yw: number,
		readonly N: number,
		readonly E: number,
		readonly D: number,
		readonly time: number,
		readonly roll: number,
		readonly pitch: number,
		readonly yaw: number
	) {}
}

export class FCJParams {
	constructor(
		readonly rotation: number,
		readonly start: number,
		readonly stop: number,
		readonly moveEast: number,
		readonly moveNorth: number,
		readonly wingspan: number,
		readonly modelwingspan: number,
		readonly elevate: number,
		readonly originLat: number,
		readonly originLng: number,
		readonly originAlt: number,
		readonly pilotLat: string,
		readonly pilotLng: string,
		readonly pilotAlt: string,
		readonly centerLat: string,
		readonly centerLng: string,
		readonly centerAlt: string,
		readonly schedule: string[]
	) {}
}

export class FCJHumanResult {
	constructor(
		readonly name: string,
		readonly date: string,
		readonly scores: number[]
	) {}
}

export class FCJScoreProps {
	constructor(
		readonly difficulty: number,
		readonly truncate: boolean
	) {}

	summary() {
		return `${['easy', 'medium', 'hard'][this.difficulty - 1]} ${this.truncate ? 'Truncated' : ''}`;
	}
}

export class FCJScore {
	constructor(
		readonly intra: number,
		readonly inter: number,
		readonly positioning: number,
		readonly total: number
	) {}
	static empty() {
		return new FCJScore(0, 0, 0, 0);
	}
}

export class FCJResult {
	constructor(
		readonly score: FCJScore,
		readonly properties: FCJScoreProps
	) {}
	static parse(data: FCJResult) {
		return new FCJResult(
			Object.setPrototypeOf(data.score, FCJScore.prototype),
			Object.setPrototypeOf(data.properties, FCJScoreProps.prototype)
		);
	}
}

export class ElSplit {
	constructor(
		readonly name: string,
		readonly start: number,
		readonly stop: number
	) {}
}

export class FCJManResult {
	constructor(
		readonly els: ElSplit[],
		readonly results: FCJResult[]
	) {}

	static parse(data: Record<string, any>) {
		return new FCJManResult(
			data.els.map((v) => Object.setPrototypeOf(v, ElSplit.prototype)),
			data.results?.map((v) => FCJResult.parse(v)) || []
		);
	}

	get_score(difficulty: number, truncate: boolean) {
		return this.results.find((v: FCJResult) =>
			_.isEqual(Object.setPrototypeOf(v.properties, {}), { difficulty, truncate })
		);
	}

	compareSplit(other: FCJManResult) {
		return this.els.every(
			(v, i) =>
				v.start === other.els[i].start &&
				v.stop === other.els[i].stop &&
				v.name === other.els[i].name
		);
	}

}



export class FCSResult {
	constructor(
		readonly fa_version: string,
		readonly manresults: FCJManResult[]
	) {}

	static parse(data: FCSResult) {
		const mres: FCJManResult[] = Array(data.manresults.length);
		data.manresults.forEach((v, i) => {
			if (v) {
				mres[i] = FCJManResult.parse(v);
			}
		});
		return new FCSResult(data.fa_version, mres);
	}

	get_scores(difficulty: number, truncate: boolean) {
		return this.manresults.map((v: FCJManResult) => {
			return v?.get_score(difficulty, truncate);
		});
	}
}



export class FCJson {
	unique_names: string[] = [];
	short_name: string;
	sinfo: ScheduleInfo;
	origin: Origin;
	constructor(
		readonly version: string,
		readonly comments: string,
		readonly name: string,
		readonly view: Record<string, any>,
		readonly parameters: FCJParams,
		readonly scored: boolean,
		readonly scores: number[],
		readonly human_scores: FCJHumanResult[] = [],
		readonly fcs_scores: FCSResult[] = [],
		readonly mans: FCJMan[],
		readonly data: FCJData[]
	) {
		this.mans.forEach((man: FCJMan) => {
			let mname = man.name;
			let i = 1;
			while (this.unique_names.includes(mname)) {
				i++;
				mname = man.name + i.toString();
			}
			this.unique_names.push(mname);
		});

		this.short_name = this.name.replace(/\.[^/.]+$/, '');
		this.sinfo = ScheduleInfo.from_fcj_sch(this.parameters.schedule);
		this.origin = new Origin(
			parseFloat(this.parameters.pilotLat),
			parseFloat(this.parameters.pilotLng),
			typeof this.parameters.originAlt == 'number'
				? this.parameters.originAlt
				: parseFloat(this.parameters.originAlt),
			(this.parameters.rotation * 180) / Math.PI,
			this.parameters.moveEast,
			this.parameters.moveNorth
		);
	}

	static parse(data: Record<string, any>) {
		return new FCJson(
			data.version,
			data.comments,
			data.name,
			data.view,
			Object.setPrototypeOf(data.parameters, FCJParams.prototype),
			data.scored,
			data.scores,
			data.human_scores!,
			data.fcs_scores ? data.fcs_scores.map((v) => FCSResult.parse(v)) : [],
			data.mans.map((v) => Object.setPrototypeOf(v, FCJMan.prototype)),
			data.data.map((v) => Object.setPrototypeOf(v, FCJData.prototype))
			//data.jhash
		);
	}

	manhistory(mid: number) {
		return Object.fromEntries(
			this.fcs_scores.map((mr) => {
				return [mr.fa_version, mr.manresults[mid]];
			})
		);
	}

	get_mandata(i: number) {
		return this.data.slice(this.mans[i].start, this.mans[i].stop);
	}

	get_result(version: string | undefined) {
		return this.fcs_scores.find((v: FCSResult) => v.fa_version === version);
	}

	add_result(version: string, name: string, manresult: FCJManResult) {
		this.add_result_id(version, this.unique_names.indexOf(name), manresult);
	}

	add_result_id(version: string, id: number, manresult: FCJManResult) {
		let res = this.get_result(version);

		if (!res) {
			res = new FCSResult(version, Array(this.mans.length));
			this.fcs_scores.push(res);
		}
		res.manresults[id] = manresult;
	}

	export_data() {
		return {
			version: this.version,
			comments: this.comments,
			name: this.name,
			view: this.view,
			parameters: this.parameters,
			scored: this.scored,
			scores: this.scores,
			human_scores: this.human_scores,
			fcs_scores: this.fcs_scores,
			mans: this.mans,
			data: this.data
		};
	}
}
