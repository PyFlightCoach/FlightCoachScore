import { ManInfo } from '$lib/schedules/maninfo';
import { type Arg, equals } from '$lib/components/special_inputs/inputs';
import type { ElementBuilder } from './schedule_builder';
import * as inputs from '$lib/components/special_inputs/inputs';

export class PE {
	kind: string;
	args: Arg[];
	kwargs: Record<string, Arg>;
	centred: boolean;
	constructor(kind: string, args: Arg[], kwargs: Record<string, Arg>, centred: boolean = false) {
		this.kind = kind;
		this.args = args;
		this.kwargs = kwargs;
		this.centred = centred;
	}
}

export const peSummary = (pe: PE, builder: ElementBuilder) => {
	return `${pe.kind} ${builder.args
		.map((a, i) => `(${inputs.inputMap[a as keyof typeof inputs.inputMap].formatArg(pe.args[i])})`)
		.join(',')}`;
};

export const peCompare = (one: PE | undefined, other: PE | undefined) => {
	if (!one || !other) {
		return false;
	} else if (one.kind !== other.kind) {
		return false;
	} else if (one.args.some((a, i) => !equals(other.args[i], a))) {
		console.log('arg missmatch', one.args, other.args);
		return false;
	} else if (Object.keys(one.kwargs).some((k) => !equals(one.kwargs[k], other.kwargs[k]))) {
		console.log('kwarg missmatch', one.kwargs, other.kwargs);
		return false;
	} else if (Object.keys(other.kwargs).filter((k) => !Object.keys(one.kwargs).includes(k)).length) {
		console.log('missing kwarg', one.kwargs, other.kwargs);
		return false;
	} else {
		return true;
	}
};


export class Figure {
	relax_back: boolean;
	constructor(
		readonly info: ManInfo,
		readonly elements: (PE | number)[] = [],
		readonly ndmps: Record<string, number | number[][]> = {},
		relax_back: boolean = false
	) {
		this.relax_back = relax_back;
	}

	static parse(data: Record<string, any>): Figure | FigOption {
		if (data.figures) {
			return new FigOption(data.figures.map((d: Record<string, any>) => Figure.parse(d)));
		} else if (data.options) {
			return new FigOption(data.options.map((d: Record<string, any>) => Figure.parse(d)));
		} else {
			return new Figure(
				ManInfo.parse(data.info),
				data.elements.map((el: Record<string, any>) => {
					if (typeof el === 'number') {
						return el;
					} else {
						return new PE(el.kind, el.args, el.kwargs, el.centred);
					}
				}),
				data.ndmps,
				data.relax_back
			);
		}
	}
}

export function extractComboNdMps(
	ndmps: Record<string, number | number[][]>
): Record<string, number[][]> {
	return Object.fromEntries(Object.entries(ndmps).filter(([_, v]) => Array.isArray(v))) as Record<
		string,
		number[][]
	>;
}

export function extractComparisonNdMps(
  ndmps: Record<string, number | number[][]>
): Record<string, number> {
  return Object.fromEntries(Object.entries(ndmps).filter(([_, v]) => !Array.isArray(v))) as Record<
    string,
    number
  >;
}

export class FigOption {
	active: number = 0;
	constructor(
		readonly options: Figure[],
		active: number = 0
	) {
		this.active = active;
	}

	get info() {
		return this.options[this.active].info;
	}
	get elements() {
		return this.options[this.active].elements;
	}
	get ndmps() {
		return this.options[this.active].ndmps;
	}
	get relax_back() {
		return this.options[this.active].relax_back;
	}
}
