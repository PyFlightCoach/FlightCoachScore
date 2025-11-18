import { objmap } from '$lib/utils/arrays';
import * as units from '$lib/utils/units';
import _ from 'lodash';
import { ManInfo } from './info.svelte';
import { Result } from './scores';

export function split_arg_string(arg_string: string) {
	const args = arg_string.split(',');
	return Object.fromEntries(
		args.map((arg) => {
			const [key, value] = arg.split(':');
			return [key, Number(value)];
		})
	);
}


export interface ICriteria {
	lookup: Record<string, object>;
	kind: string;
	min_bound?: number | undefined;
	max_bound?: number | undefined;
	limit?: number | undefined;
	desired?: number[][];
}

export class Criteria {
	constructor(
		readonly lookup: Record<string, object>,
		readonly kind: string,
		readonly min_bound: number | undefined = undefined,
		readonly max_bound: number | undefined = undefined,
		readonly limit: number | undefined = undefined,
		readonly desired: number[][] | undefined = undefined
	) {}
	static parse(data: ICriteria) {
		return new Criteria(
			data.lookup,
			data.kind,
			data.min_bound,
			data.max_bound,
			data.limit,
			data.desired
		);
	}
}


export class DG {
  static parse(data: IPairedDownGrade | IDownGrade) {
    if ('first' in data) {
      return new PairedDownGrade(
        data.name,
        DownGrade.parse(data.first),
        DownGrade.parse(data.second)
      );
    } else {
      return DownGrade.parse(data);
    }
  }
}


export interface IDownGrade {
	name: string;
	measure: string;
	smoothers: string[];
	selectors: string[];
	criteria: ICriteria;
	display_name: string;
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

	static parse(data: IDownGrade) {
		return new DownGrade(
			data.name,
			data.measure,
			data.smoothers,
			data.selectors,
			Criteria.parse(data.criteria),
			data.display_name
		);
	}

	dump() {
		return {
			name: this.name,
			measure: this.measure,
			smoothers: this.smoothers,
			selectors: this.selectors,
			criteria: this.criteria,
			display_name: this.display_name
		} as IDownGrade;
	}

  summarise_smoothers() {
    return this.smoothers.filter(sm => !sm.startsWith("final"))
  }


	criteria_description(result: Result) {
		const fac = result.scale(); // result.measurement.unit == 'rad' ? 180 / Math.PI : 1;
		const unit = result.measurement.unit.replace('rad', '°');

		switch (this.criteria.kind) {
			case 'Trough':
				return `The largest absolute value is downgraded based on its distance below ${(fac * this.criteria.limit!).toFixed(2)} ${unit}.`;
			case 'Peak':
				return `The largest absolute value is downgraded based on its distance above ${(this.criteria.limit! * fac).toFixed(2)} ${unit}.`;
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
      case 'Deviation':
        return `The entire sample is downgraded based on its standard deviation.`;
		}
	}

	describe_selectors() {
		let all = true;
		const sels: string[] = this.selectors.reverse().map((v) => {
			const method = v.match(/^[^(]+/);
			const argmatch = v.match(/\(([^()]+)\)/);
			const args = argmatch ? split_arg_string(argmatch[1]) : {};

			switch (method![0]) {
				case 'before_slowdown':
				case 'after_slowdown':
				case 'after_speedup':
				case 'before_speedup':
					return `${method![0].includes('before') ? 'before' : 'after'} the speed has ${method![0].includes('speedup') ? 'increased above' : 'reduced below'} ${args.sp} m/s`;
				case 'autorot_break':
					return `before the autorotation has rotated by ${((args.rot * 180) / Math.PI).toFixed(0)}°.`;
				case 'autorot_recovery':
					return `during the last ${((args.rot * 180) / Math.PI).toFixed(0)}° of autorotation`;
				case 'autorotation':
					return `${((args.brot * 180) / Math.PI).toFixed(0)}° from the start to ${((args.rrot * 180) / Math.PI).toFixed(0)}° before the end of the autorotation`;
				case 'before_recovery':
					return `before the last ${((args.rot * 180) / Math.PI).toFixed(0)}° of autorotation`;
				case 'first':
				case 'last':
				case 'first_and_last':
				case 'maximum':
				case 'minimum':
					all = false;
					return `${method![0].replaceAll('_', ' ')} value`;
				case 'absmax':
					all = false;
					return `maximum absolute value`;
				case 'middle':
					all = false;
					return `middle of the sample, with a margin of ${args.chopt} seconds`;
				default:
					return '';
			}
		});

		return `${all ? 'All values' : 'The'} ${sels.join(' ')}`;
	}
}



export interface IPairedDownGrade {
  name: string;
  first: IDownGrade;
  second: IDownGrade;
}

export class PairedDownGrade {
  constructor(
    readonly name: string,
    readonly first: DownGrade,
    readonly second: DownGrade
  ) {}
  static parse(data: IPairedDownGrade) {
    return new PairedDownGrade(
      data.name,
      DownGrade.parse(data.first),
      DownGrade.parse(data.second)
    );
  }
  dump() {
    return {
      name: this.name,
      first: this.first.dump(),
      second: this.second.dump()
    } as IPairedDownGrade;
  }
  summarise_smoothers() {return ""}
  criteria_description(result: Result) {
    return ""
  }
  describe_selectors() {
    return ""
  }
}

export interface IManParm {
	defaul: string | number;
	name: string;
	criteria: ICriteria;
	unit: units.BaseUnit;
	collectors: Record<string, never>;
	visibility: string | undefined;
}

export class MPValue {
  value: number | undefined = $state();
	constructor(
		value: number,
		readonly unit: units.BaseUnit
	) {this.value=value;}
}

export class ManParm {
	defaul: string | number | undefined = $state();
	constructor(
		readonly name: string,
		readonly criteria: ICriteria,
		readonly unit: units.BaseUnit,
		readonly collectors: Record<string, never>,
		readonly visibility: string | undefined = undefined,
		defaul: string | number
	) {
		this.defaul = defaul;
	}

	static parse(data: IManParm) {
		return new ManParm(
			data.name,
			data.criteria,
			data.unit,
			data.collectors,
			data.visibility,
			data.defaul
		);
	}

	dump() {
		return {
			name: this.name,
			criteria: this.criteria,
			unit: this.unit,
			collectors: this.collectors,
			visibility: this.visibility,
			defaul: this.defaul
		} as IManParm;
	}

	get mpValues() {
		if (this.criteria.kind == 'Comparison') {
      const res: Record<string, MPValue> = {};
      res[this.name] = new MPValue(this.defaul as number, this.unit);
			return res;
		} else {
			return Object.fromEntries(
				this.criteria.desired![this.defaul as number].map((v: number, i: number) => [
					`${this.name}[${i}]`,
					new MPValue(v, this.unit)
				])
			);
		}
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

export interface IElDef {
	name: string;
	Kind: string;
	props: object;
	dgs: Record<string, IDownGrade | IPairedDownGrade>;
}

export class ElDef {
	constructor(
		readonly name: string,
		readonly Kind: string,
		readonly props: object,
		readonly dgs: Record<string, DownGrade>
	) {}

	get describe() {
		return `${this.name} (${this.Kind}) `;
	}
	static parse(data: IElDef) {
		return new ElDef(data.name, data.Kind, data.props, objmap(data.dgs, (_, v) => DG.parse(v)) as Record<string, DownGrade>);
	}

	dump() {
		return {
			name: this.name,
			Kind: this.Kind,
			props: this.props,
			dgs: objmap(this.dgs, (_, d) => d.dump())
		} as IElDef;
	}

	getDG(critn: string | undefined) {
		for (const dg in this.dgs) {
			if (this.dgs[dg].display_name == critn || dg == critn) {
				return this.dgs[dg];
			}
		}
	}
}

export interface IManDef {
	info: ManInfo;
	mps: Record<string, IManParm>;
	eds: Record<string, IElDef>;
	box: object;
}

export class ManDef {
	constructor(
		readonly info: ManInfo,
		readonly mps: Record<string, ManParm>,
		readonly eds: Record<string, ElDef>,
		readonly box: object
	) {}

	get options() {
		return [this];
	}

	static parse(data: IManDef | IManDef[] | IManOpt): ManDef | ManOpt {
		if (Array.isArray(data)) {
			return ManOpt.parse(data);
		} else if (Object.keys(data).includes('options')) {
			return ManOpt.parse((data as IManOpt).options);
		} else {
			return new ManDef(
				ManInfo.parse((data as IManDef).info),
				objmap((data as IManDef).mps, (_, v)=>ManParm.parse(v)),
				objmap((data as IManDef).eds, (_, v)=>ElDef.parse(v)),
				(data as IManDef).box
			);
		}
	}

	dump(info: ManInfo | undefined = undefined, new_name: string | undefined = undefined) {
		return {
			info: info?.dump(new_name) || this.info.dump(),
			mps: objmap(this.mps, (_, v) => v.dump()),
			eds: objmap(this.eds, (_, e) => e.dump()),
			box: this.box
		} as IManDef;
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
	setmp(name: string, value: string | number) {
		this.mps[name].defaul = value;
	}

  checkElementNames(els: string[]) {
    const elnames = Object.keys(this.eds);
    return els.length == elnames.length && els.every((v,i)=>v==elnames[i]);
  }
}
export interface IManOpt {
	options: IManDef[];
}

export class ManOpt {
	active = $state(0);
	constructor(
		readonly options: ManDef[],
		active: number = 0
	) {
		this.active = active;
	}

	get info() {
		return this.options[this.active].info;
	}
	get eds() {
		return this.options[this.active].eds;
	}
	get mps() {
		return this.options[this.active].mps;
	}
	get box() {
		return this.options[this.active].box;
	}

	static parse(data: IManDef[]) {
		return new ManOpt(data.map((v) => ManDef.parse(v) as ManDef));
	}

	dump() {
		return this.options.map((v) => v.dump());
	}

	setmp(name: string, value: string | number) {
		this.options.forEach((o) => o.setmp(name, value));
	}

  activeOption(mdef: ManDef | ManOpt) {
    if (mdef instanceof ManOpt) {
      return undefined;
    } else {
      const optionID = this.options.findIndex(o=>{o.checkElementNames(Object.keys(mdef.eds))});
      return optionID >=0 ? optionID : undefined;
    }
  }

}
