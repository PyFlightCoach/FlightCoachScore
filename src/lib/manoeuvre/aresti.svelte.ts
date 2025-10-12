import { equals } from '$lib/manoeuvre/special_inputs/inputs';
import type { ElementBuilder, ManBuilder } from '$lib/manoeuvre/builder.svelte';
import * as inputs from '$lib/manoeuvre/special_inputs/inputs';
import { ManInfo, type IManInfo } from './info.svelte';
import { objfilter, objmap } from '$lib/utils/arrays';
import { MPValue } from './definition.svelte';

export type Arg = number | string | (number | string)[] | boolean;

export interface IPE {
	kind: string;
	args: Arg[];
	kwargs: Record<string, Arg>;
	centred: boolean;
}

export class PE {
	args: Arg[] = $state([]);
	kwargs: Record<string, Arg> = $state({});
	centred: boolean = $state(false);
	constructor(
		readonly kind: string,
		args: Arg[] = [],
		kwargs: Record<string, Arg> = {},
		centred: boolean = false
	) {
		this.args = args;
		this.kwargs = kwargs;
		this.centred = centred;
	}

	static parse(data: IPE) {
		return new PE(data.kind, data.args, data.kwargs, data.centred);
	}

	dump() {
		return {
			kind: this.kind,
			args: this.args,
			kwargs: this.kwargs,
			centred: this.centred
		} as IPE;
	}

	copy() {
		return new PE(
			this.kind,
			$state.snapshot(this.args),
			$state.snapshot(this.kwargs),
			this.centred
		);
	}

	summary(builder: ElementBuilder) {
		return `${this.kind} ${builder.args
			.map(
				(a, i) =>
					`(${inputs.inputMap[a as keyof typeof inputs.inputMap].formatArg(this.args[i] as never)})`
			)
			.join(',')}`;
	}

	static compare(one: PE | undefined, other: PE | undefined) {
		if (!one || !other) {
			return false;
		} else if (one.kind !== other.kind) {
			return false;
		} else if (one.args.some((a, i) => !equals(other.args[i], a))) {
			return false;
		} else if (Object.keys(one.kwargs).some((k) => !equals(one.kwargs[k], other.kwargs[k]))) {
			return false;
		} else if (
			Object.keys(other.kwargs).filter((k) => !Object.keys(one.kwargs).includes(k)).length
		) {
			return false;
		} else {
			return true;
		}
	}
}

export interface IFigure {
	info: IManInfo;
	elements: (IPE | number)[];
	ndmps: Record<string, number | number[][]>;
	relax_back: boolean;
}

export interface IFigureOption {
	figures: IFigure[];
}

export class Combination {
	desired: number[][] = $state([]);
	active: number = $state(0);
	constructor(desired: number[][], active: number = 0) {
		this.desired = desired;
		this.active = active;
	}
	dump() {
		return this.desired;
	}
	copy() {
		return new Combination($state.snapshot(this.desired), this.active);
	}
	get values() {
		return this.desired[this.active];
	}
}

export class Figure {
	elements: (number | PE)[] = $state([]);
	comparisons: Record<string, number> = $state({});
	combinations: Record<string, Combination> = $state({});
	relax_back: boolean = $state(false);
	constructor(
		elements: (number | PE)[],
		comparisons: Record<string, number> = {},
		combinations: Record<string, Combination> = {},
		relax_back: boolean
	) {
		this.elements = elements;
		this.comparisons = comparisons;
		this.combinations = combinations;
		this.relax_back = relax_back;
	}

	copy() {
		return new Figure(
			this.elements.map((el) => (typeof el === 'number' ? el : el.copy())),
			$state.snapshot(this.comparisons),
			objmap(this.combinations, (_, v) => v.copy()),
			this.relax_back
		);
	}

	static equals(one: Figure, other: Figure) {
		if (one.elements.length !== other.elements.length) {
			return false;
		}
		if (
			!one.elements.every((el, i) => {
				if (typeof el === 'number') {
					return typeof other.elements[i] === 'number' && el === other.elements[i];
				} else {
					return PE.compare(el, other.elements[i] as PE);
				}
			})
		) {
			return false;
		}
		if (!equals(Object.keys(one.comparisons), Object.keys(other.comparisons))) {
			return false;
		}
		if (!equals(Object.values(one.comparisons), Object.values(other.comparisons))) {
			return false;
		}
		if (!equals(Object.keys(one.combinations), Object.keys(other.combinations))) {
			return false;
		}
		if (
			!equals(
				Object.values(one.combinations).map((v) => v.desired),
				Object.values(one.combinations).map((v) => v.desired)
			)
		) {
			return false;
		}
		if (one.relax_back !== other.relax_back) {
			return false;
		}
		return true;
	}

	static parse(data: IFigure | IFigureOption): { info: ManInfo; figure: Figure | FigOption } {
		if ('figures' in data || Array.isArray(data)) {
			return FigOption.parse(data as IFigureOption);
		} 
		return {
			info: ManInfo.parse(data.info),
			figure: new Figure(
				data.elements.map((el) => {
					if (typeof el === 'number') {
						return el;
					} else {
						return PE.parse(el);
					}
				}),
				objfilter(data.ndmps, (_, v) => !Array.isArray(v)) as Record<string, number>,
				objmap(
					objfilter(data.ndmps, (_, v) => Array.isArray(v)),
					(_, v) => new Combination(v as number[][])
				),
				data.relax_back
			)
		};
	}

	get figures() {
		return [this];
	}

	get ndmps() {
		return { ...this.comparisons, ...objmap(this.combinations, (_, v) => v.dump()) };
	}

	mpValues(builder: ManBuilder) {
		let base_parms: Record<string, MPValue> = {};
		Object.values(builder.parameters).forEach((p) => {
			base_parms = { ...base_parms, ...p.mpValues };
		});
		Object.entries(this.comparisons).forEach(([k, v]) => {
			base_parms[k as keyof typeof base_parms].value = v;
		});
		Object.entries(this.combinations).forEach(([k, v]) => {
			v.desired[v.active].forEach((val, i) => {
				base_parms[`${k}[${i}]`] = new MPValue(val, 'rad');
			});
		});
		return base_parms;
	}

	dump(info: ManInfo, new_name: string | undefined = undefined) {
		return {
			info: info.dump(new_name),
			elements: this.elements.map((el) => {
				if (typeof el === 'number') {
					return el;
				} else {
					return el.dump();
				}
			}),
			ndmps: this.ndmps,
			relax_back: this.relax_back
		} as IFigure;
	}
}

export class FigOption {
	figures: Figure[] = $state([]);
	active: number = $state(0);
	constructor(figures: Figure[], active: number = 0) {
		this.figures = figures;
		this.active = active;
	}

	dump(info: ManInfo): IFigureOption {
		return {figures: this.figures.map((o) => o.dump(info))};
	}

	static parse(data: IFigureOption): { info: ManInfo; figure: Figure | FigOption } {
    if (Array.isArray(data)) {
      data = { figures: data };
    }
		const figs = data.figures.map((f) => Figure.parse(f));
		return { info: figs[0].info, figure: new FigOption(figs.map((f) => f.figure as Figure)) };
	}

	get elements() {
		return this.figures[this.active].elements;
	}
	get ndmps() {
		return this.figures[this.active].ndmps;
	}
	get relax_back() {
		return this.figures[this.active].relax_back;
	}
	get comparisons() {
		return this.figures[this.active].comparisons;
	}
	get combinations() {
		return this.figures[this.active].combinations;
	}

	get mpValues() {
		return this.figures[this.active].mpValues;
	}
}
