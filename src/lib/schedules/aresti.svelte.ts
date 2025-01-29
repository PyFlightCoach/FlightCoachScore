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


export class PE implements IPE {
  args: Arg[] = $state([])
  kwargs: Record<string, Arg> = $state({})
  centred: boolean = $state(false)
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

  static parse (data: IPE) {
    return new PE(data.kind, data.args, data.kwargs, data.centred);
  };

  summary  (builder: ElementBuilder)  {
    return `${this.kind} ${builder.args
      .map((a, i) => `(${inputs.inputMap[a as keyof typeof inputs.inputMap].formatArg(this.args[i] as never)})`)
      .join(',')}`;
  };

  static compare (one: PE | undefined, other: PE | undefined) {
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


export interface IFig {
  elements: (IPE | number)[];
	ndmps: Record<string, number | number[][]>;
	relax_back: boolean;
};
export interface IFigure extends IFig {
	info: IManInfo;
};

export interface IFigOption {
  info: IManInfo;
  figures: IFig[];
}

export interface IFigureOption {
  figures: IFigure[]
}

export class Fig implements IFig {
  elements: (number | IPE)[] = $state([]);
  ndmps: Record<string, number | number[][]> = $state({});
  relax_back: boolean = $state(false);
  constructor(
    elements: (number | IPE)[],
    ndmps: Record<string, number | number[][]>,
    relax_back: boolean
  ) {
    this.elements = elements;
    this.ndmps = ndmps;
    this.relax_back = relax_back;
  }

	static parse(data: IFig): Fig {
    return new Fig(
      data.elements.map((el) => {
        if (typeof el === 'number') {
          return el;
        } else {
          return PE.parse(el);
        }
      }),
      data.ndmps,
      data.relax_back
    );
	}  
}

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
