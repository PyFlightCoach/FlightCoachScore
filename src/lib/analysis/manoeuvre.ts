export class Loop {
	constructor(
    readonly kind: string,
		readonly uid: string,
		readonly speed: number,
		readonly radius: number,
		readonly roll: number,
		readonly ke: number
	) {}

  describe() {
    return `Loop at ${this.speed.toFixed(0)} m/s with radius ${this.radius.toFixed(0)} m and roll ${(this.roll * 180 / Math.PI).toFixed(0)}°`;
  }
}

export class Line {
	constructor(
    readonly kind: string,
		readonly uid: string,
		readonly speed: number,
		readonly length: number,
		readonly roll: number
	) {}

  describe() {
    if (this.roll==0) {
      return `Line at ${this.speed.toFixed(0)} m/s with length ${this.length.toFixed(0)} m`;
    } else {
      return `${(this.roll * 180 / Math.PI).toFixed(0)}° roll at ${this.speed.toFixed(0)} m/s and length ${this.length.toFixed(0)} m`; 
    }    
  }
}

export class Snap {
	constructor(
    readonly kind: string,
		readonly uid: string,
		readonly speed: number,
		readonly length: number,
		readonly roll: number,
		readonly pitch: number,
		readonly break_roll: number,
		readonly recovery_roll: number
	) {}

  describe() {
    return `${(this.roll * 180 / Math.PI).toFixed(0)}° snap roll at ${this.speed.toFixed(0)} m/s `;
  }
}

export class Spin {
	constructor(
    readonly kind: string,
		readonly uid: string,
		readonly speed: number,
		readonly height: number,
		readonly turns: number,
		readonly pitch: number,
		readonly drop_turns: number,
		readonly recovery_turns: number
	) {}
  
    describe() {
      return `${(this.turns * 180 / Math.PI).toFixed(0)}° spin at ${this.speed.toFixed(0)} m/s, height ${this.height.toFixed(0)} m`;
    }
}

export class StallTurn {
  constructor(
    readonly kind: string,
    readonly uid: string,
    readonly yaw_rate: number,
  ) {}

  describe() {
    return `Stall turn with yaw rate ${(this.yaw_rate * 180 / Math.PI).toFixed(0)}°/s`;
  }
}

export class Manoeuvre {
	constructor(
		readonly elements: Record<string, any>[],
		readonly exit_line: Record<string, any>,
		readonly uid: string
	) {}

	static parse(data: Record<string, any>) {
		return new Manoeuvre(data.elements, data.exit_line, data.uid);
	}

	getEl(elName: string | undefined): Line | Loop | Snap | Spin | StallTurn | undefined{
		for (let el of this.elements) {
			if (el.uid == elName) {
				switch (el.kind) {
          case 'Line':
            return Object.setPrototypeOf(el, Line.prototype);
          case 'Loop':
            return Object.setPrototypeOf(el, Loop.prototype);
          case 'Snap':
            return Object.setPrototypeOf(el, Snap.prototype);
          case 'Spin':
            return Object.setPrototypeOf(el, Spin.prototype);
          case 'StallTurn':
            return Object.setPrototypeOf(el, StallTurn.prototype);
        }
			}
		}
	}

	elInfo(name: string) {
		const el = Manoeuvre.remove_ret('scoring', this.getEl(name)!);

		function format(input: any) {
			if (typeof input == 'number') {
				return input.toFixed(2);
			} else {
				return String(input);
			}
		}

		return Object.entries(el).map((row) => String(row[0]) + '=' + format(row[1]));
	}

	static remove_ret(name: string, data: Record<string, any>) {
		let outp: Record<string, any> = {};
		Object.entries(data).forEach((v) => {
			if (v[0] != name) {
				outp[v[0]] = v[1];
			}
		});
		return outp;
	}
}
