import { parse_dict } from '$lib/utils/arrays';
import { Result } from './scores';

export const Heights = ['BTM', 'MID', 'TOP'] as const;
export const Directions = ['DRIVEN', 'UPWIND', 'DOWNWIND'] as const;
export const Orientations = ['DRIVEN', 'UPRIGHT', 'INVERTED'] as const;
export const Positions = ['CENTRE', 'END'] as const;
export type Height = (typeof Heights)[number];
export type Direction = (typeof Directions)[number];
export type Orientation = (typeof Orientations)[number];
export type Position = (typeof Positions)[number];

export class BoxLocation {
	constructor(
		readonly h: Height,
		readonly d: Direction,
		readonly o: Orientation
	) {}
}

export class ManInfo {
	constructor(
		readonly name: string,
		readonly short_name: string,
		readonly k: number,
		readonly position: Position,
		readonly start: BoxLocation,
		readonly end: BoxLocation,
		readonly centre_points: number[],
		readonly centred_els: number[][]
	) {}

	static parse(data: ManInfo) {
		return new ManInfo(
			data.name,
			data.short_name,
			data.k,
			data.position,
			Object.setPrototypeOf(data.start, BoxLocation.prototype),
			Object.setPrototypeOf(data.end, BoxLocation.prototype),
			data.centre_points,
			data.centred_els
		);
	}

	static default() {
		return new ManInfo(
			'new manoeuvre',
			'man',
			0,
			'CENTRE',
      {Kind:'TriangularBox'},
			new BoxLocation('BTM', 'UPWIND', 'UPRIGHT'),
			new BoxLocation('BTM', 'DRIVEN', 'DRIVEN'),
			[],
			[]
		);
	}
}

export class ManParm {
	constructor(
		readonly name: string,
		readonly criteria: Record<string, any>,
		readonly defaul: any,
		readonly unit: string,
		readonly collectors: Record<string, any>
	) {}

	static parse(data: Record<string, any>) {
		return new ManParm(data.name, data.criteria, data.defaul, data.unit, data.collectors);
	}

	getCollectorEls(els: string[]) {
		return Object.values(this.collectors).map((c: string) => {
			const elList: string[] = [];
			const words = c.split(/[^A-Za-z_0-9]/);
			els.forEach((el: string) => {
				if (words.includes(el)) {
					elList.push(el);
				}
			});
			return elList;
		});
	}
}

export class Criteria {
	constructor(
		readonly lookup: Record<string, any>,
		readonly kind: string,
		readonly min_bound: number | undefined = undefined,
		readonly max_bound: number | undefined = undefined,
		readonly limit: number | undefined = undefined
	) {}
	static parse(data: Record<string, any>) {
		return new Criteria(data.lookup, data.kind, data.min_bound, data.max_bound, data.limit);
	}
}


export function split_arg_string(arg_string: string) {
	const args = arg_string.split(',');
	return Object.fromEntries(args.map((arg) => {
		const [key, value] = arg.split(':');
		return [key, Number(value)];
	}));
}


export class DownGrade {
	constructor(
		readonly name: string,
		readonly measure: string,
		readonly smoothers: string[],
		readonly selectors: string[],
		readonly criteria: Criteria,
		readonly display_name: string
	) {}


	criteria_description(result: Result) {
		let fac = result.scale();// result.measurement.unit == 'rad' ? 180 / Math.PI : 1;
		let unit = result.measurement.unit.replace('rad', '°');
		
		switch (this.criteria.kind){
			case 'Trough': 
				return `The largest absolute value is downgraded based on its distance below ${(fac * this.criteria.limit!).toFixed(2)} ${unit}.`;
			case 'Peak': 
				return `The largest absolute value is downgraded based on its distance above ${(this.criteria.limit  * fac).toFixed(2)} ${unit}.`;
			case 'Single': 
				return `All values in the sample are downgraded.`;
			case 'Limit': 
				return `All values are downgraded based on the distance above ${(this.criteria.limit! * fac).toFixed(2)} ${unit}.`;
			case 'Continuous': 
				return `All peaks in the absolute value of the sample are downgraded based on the distance above the last trough or zero.`;
			case 'ContinuousValue': 
				return `All peaks and troughs are downgraded based on the distance from the last peak or trough.`;
			case 'Bounded':
				return `Regions of the sample below ${(this.criteria.min_bound! * fac).toFixed(2)} ${unit} or above ${(this.criteria.max_bound! * fac).toFixed(2)} ${unit} are downgraded.`;
		  };
	}

	describe_selectors() {

		let all=true;
		const sels: string[] = this.selectors.reverse().map(v=>{
			const method = v.match(/^[^(]+/);
			const argmatch = v.match(/\(([^()]+)\)/);
			const args = argmatch? split_arg_string(argmatch[1]) : {};
	
			switch (method![0]) {
				case 'before_slowdown':
				case 'after_slowdown':
				case 'after_speedup':
				case 'before_speedup':
					const before = method![0].includes('before')? 'before' : 'after';
					const increased = method![0].includes('speedup')? 'increased above' : 'reduced below';
	
					return `${before} the speed has ${increased} ${args.sp} m/s`;
					
				case 'autorot_break':
					return `before the autorotation has rotated by ${(args.rot * 180 / Math.PI).toFixed(0)}°.`;
				case 'autorot_recovery':
					return `during the last ${(args.rot * 180 / Math.PI).toFixed(0)}° of autorotation`;
				case 'autorotation':
					return `${(args.brot * 180 / Math.PI).toFixed(0)}° from the start to ${(args.rrot * 180 / Math.PI).toFixed(0)}° before the end of the autorotation`;
				case 'before_recovery':
					return `before the last ${(args.rot * 180 / Math.PI).toFixed(0)}° of autorotation`;
				case 'first':
				case 'last':
				case 'first_and_last':
				case 'maximum':
				case 'minimum':
					all=false;
					return `${method![0].replaceAll("_", " ")} value`;
				case 'absmax':
					all=false;
					return `maximum absolute value`;
        case 'borders':
          all=false;
          return `middle of the sample, with a margin of ${args.tb} seconds`;
				default:
					return '';
			}
			
		});
	
		return `${all? 'All values': 'The'} ${sels.join(' ')}`;
	}


	static parse(data: Record<string, any>) {
		return new DownGrade(
			data.name,
			data.measure,
			data.smoothers,
			data.selectors,
			Criteria.parse(data.criteria),
			data.display_name
		);
	}


}

export class ElDef {
	constructor(
		readonly name: string,
		readonly Kind: string,
		readonly props: Record<string, any>,
		readonly dgs: Record<string, DownGrade>
	) {}
	static parse(data: Record<string, any>) {
		const dgs = Object.fromEntries(Object.entries(data.dgs).map(([k, v]) => {
			return [k, DownGrade.parse(v)];
		}));

		return new ElDef(data.name, data.Kind, data.props, dgs);
	}

	getDG(critn: string | undefined) {
		for (const dg in this.dgs) {
			if (this.dgs[dg].display_name == critn || dg == critn) {
				return this.dgs[dg];
			}
		}
	}
}

export class ManDef {
	constructor(
		readonly info: ManInfo,
		readonly mps: Record<string, ManParm>,
		readonly eds: Record<string, ElDef>,
		readonly box: Record<string, any>,
    readonly options: ManDef[] | null = null,
	) {}
	static parse(data: Record<string, any> | Record<string, any>[]): ManDef {
		if (Array.isArray(data)) {
			return new ManDef(
				ManInfo.parse(data[0].info),
				parse_dict(data[0].mps, ManParm.parse),
				data[0].eds.map(ElDef.parse),
				data.slice(1).map(ManDef.parse)
			);
		} else {
			return new ManDef(
				ManInfo.parse(data.info),
				parse_dict(data.mps, ManParm.parse),
        Object.fromEntries(
					Object.entries(data.eds).map(([k, v]) => {
						return [k, ElDef.parse(v)];
					})
				),
        data.box,
			);
		}
	}

	getEd(dgn: string | undefined) {
		if (dgn && this.eds[dgn]) {
			return this.eds[dgn];
		}

		for (const ed in this.eds) {
			if (dgn?.startsWith(this.eds[ed].name)) {
				return this.eds[ed];
			}
		}
	}

}
