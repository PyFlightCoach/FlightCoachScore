
export const elementKinds = ['Line', 'Loop', 'Snap', 'Spin', 'Stallturn'];
export type ElementKind = (typeof elementKinds)[number];

export interface ILoop {
	kind: ElementKind;
	uid: string;
	speed: number;
	radius: number;
	roll: number;
	ke: number;
}

export interface ILine {
	kind: ElementKind;
	uid: string;
	speed: number;
	length: number;
	roll: number;
}

export interface ISnap {
	kind: ElementKind;
	uid: string;
	speed: number;
	length: number;
	roll: number;
	pitch: number;
	break_roll: number;
	recovery_roll: number;
}

export interface ISpin {
	kind: ElementKind;
	uid: string;
	speed: number;
	height: number;
	turns: number;
	pitch: number;
	drop_turns: number;
	recovery_turns: number;
}

export interface ITailslide {
	kind: ElementKind;
	uid: string;
	speed: number;
}

export interface IStallturn {
	kind: ElementKind;
	uid: string;
	yaw_rate: number;
}

export type IElement = ILine | ILoop | ISnap | ISpin | IStallturn;

const describe: Record<ElementKind, (arg0: IElement) => string> = {
	Line: (line: IElement) => {
		line = line as ILine;
		if (line.roll == 0) {
			return `Line at ${line.speed.toFixed(0)} m/s with length ${line.length.toFixed(0)} m`;
		} else {
			return `${((line.roll * 180) / Math.PI).toFixed(0)}° roll at ${line.speed.toFixed(0)} m/s and length ${line.length.toFixed(0)} m`;
		}
	},
	Loop: (loop: IElement) => {
		loop = loop as ILoop;
		return `Loop at ${loop.speed.toFixed(0)} m/s with radius ${loop.radius.toFixed(0)} m and roll ${((loop.roll * 180) / Math.PI).toFixed(0)}°`;
	},
	Snap: (snap: IElement) => {
		snap = snap as ISnap;
		return `${((snap.roll * 180) / Math.PI).toFixed(0)}° snap roll at ${snap.speed.toFixed(0)} m/s `;
	},
	Spin: (spin: IElement) => {
		spin = spin as ISpin;
		return `${((spin.turns * 180) / Math.PI).toFixed(0)}° spin at ${spin.speed.toFixed(0)} m/s, height ${spin.height.toFixed(0)} m`;
	},
	StallTurn: (stallturn: IElement) => {
		stallturn = stallturn as IStallturn;
		return `Stall turn with yaw rate ${((stallturn.yaw_rate * 180) / Math.PI).toFixed(0)}°/s`;
	}
};

export class Element {
	constructor(readonly data: IElement) {}

	describe() {
		return describe[this.data.kind as ElementKind](this.data);
	}
}

export interface IManoeuvre {
	elements: IElement[];
	exit_line: ILine;
	uid: string;
}

export class Manoeuvre {
	constructor(
		readonly elements: Element[],
		readonly exit_line: ILine,
		readonly uid: string
	) {}

	static parse(data: IManoeuvre) {
		return new Manoeuvre(
			data.elements.map(el=>new Element(el)),
			data.exit_line,
			data.uid
		);
	}
	dump() {
		return {
			elements: this.elements.map(el => el.data),
			exit_line: this.exit_line,
			uid: this.uid
		} as IManoeuvre;
	}

  getEl(name: string) {
    return this.elements.find(el => el.data.uid == name);
  }
}
