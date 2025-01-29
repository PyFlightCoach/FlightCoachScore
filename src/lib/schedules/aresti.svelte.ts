import { equals } from '$lib/components/special_inputs/inputs';
import type { ElementBuilder } from './builder.svelte';
import * as inputs from '$lib/components/special_inputs/inputs';
import { type IManInfo } from './manoeuvre/info.svelte';


export type Arg = number | string | (number | string)[] | boolean;

export interface IPE {
  kind: string;
  args: Arg[];
  kwargs: Record<string, Arg>;
  centred: boolean;
}

export interface IFig {
  elements: (IPE | number)[];
	ndmps: Record<string, number | number[][]>;
	relax_back: boolean;
};
export interface IFigure extends IFig {
	info: IManInfo;
};

export interface FigOption {
  info: IManInfo;
  figures: IFig[];
}

export interface FigureOption {
  figures: IFigure[]
}

export class PE implements IPE {
  constructor(
    readonly kind: string,
    readonly args: Arg[],
    readonly kwargs: Record<string, Arg>,
    readonly centred: boolean
  ) {}

  summary  (pe: IPE, builder: ElementBuilder)  {
    return `${pe.kind} ${builder.args
      .map((a, i) => `(${inputs.inputMap[a as keyof typeof inputs.inputMap].formatArg(pe.args[i])})`)
      .join(',')}`;
  };

}


export function compare (one: PE | undefined, other: PE | undefined) {
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


//export class Figure {
//	static parse(data: Record<string, any>): types.Figure | types.FigureOption {
//		if (data.figures) {
//			return new FigOption(data.figures.map((d: Record<string, any>) => Figure.parse(d)));
//		} else if (data.options) {
//			return new FigOption(data.options.map((d: Record<string, any>) => Figure.parse(d)));
//		} else {
//			return {
//				data.info,
//				data.elements.map((el: Record<string, any>) => {
//					if (typeof el === 'number') {
//						return el;
//					} else {
//						return new PE(el.kind, el.args, el.kwargs, el.centred);
//					}
//				}),
//				data.ndmps,
//				data.relax_back
//			};
//		}
//	}
//}

//export class FigOption {
//	active: number = 0;
//	constructor(
//		readonly options: types.Figure[],
//		active: number = 0
//	) {
//		this.active = active;
//	}
//
//	get info() {
//		return this.options[this.active].info;
//	}
//	get elements() {
//		return this.options[this.active].elements;
//	}
//	get ndmps() {
//		return this.options[this.active].ndmps;
//	}
//	get relax_back() {
//		return this.options[this.active].relax_back;
//	}
//}
