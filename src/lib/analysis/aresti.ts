import { ManInfo } from '$lib/analysis/mandef';

export class PE {
	constructor(
		readonly kind: string,
		readonly args: unknown[],
		readonly kwargs: Record<string, unknown>,
		readonly centred: boolean = false
	) {}
}

export class Figure {
	relax_back: boolean;
	constructor(
		readonly info: ManInfo,
		readonly elements: (PE | number)[] = [],
		readonly ndmps: Record<string, number | string | (number | string)[]> = {},
		relax_back: boolean = false
	) {
		this.relax_back = relax_back;
	}

	static parse(data: Record<string, any>): Figure | Figure[] {
		if (data.figures) {
			return new FigOption(data.figures.map(d => Figure.parse(d) as Figure));
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


export class FigOption {
  active: number = 0;
  constructor (
    readonly options: Figure[],
    active: number = 0
  ) {this.active = active;}

  get info() {return this.options[this.active].info;}
  get elements() {return this.options[this.active].elements;}
  get ndmps() {return this.options[this.active].ndmps;}
  get relax_back() {return this.options[this.active].relax_back;}

}