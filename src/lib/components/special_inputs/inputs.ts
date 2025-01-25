export type Arg = number | string | (number | string)[] | boolean;

export const equals = (a: Arg, b: Arg | undefined): boolean => {
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			return false;
		}
		return a.every((v, i) => equals(v, b[i]));
	} else {
		return a === b;
	}
};

export const unitMultipliers = {
	m: 1,
	'm/s': 1,
	rad: 1,
	'rad/s': 1,
	'°': Math.PI / 180,
	'°/s': Math.PI / 180,
	turn: 2 * Math.PI,
	'turn/s': 2 * Math.PI
};

export const unitOptions: Record<string, (keyof typeof unitMultipliers)[]> = {
	m: ['m'],
	rad: ['°', 'rad', 'turn'],
	'm/s': ['m/s'],
	'rad/s': ['°/s', 'rad/s', 'turn/s']
};

export const re_eqn = /^\(.\)$/;

export class NumberInput {
	constructor(
		readonly unit: keyof typeof unitOptions,
		readonly step: number
	) {}

	checkOption(value: number | string) {
		if (typeof value === 'number') {
			return 'value';
		} else if (typeof value == 'string' && value.startsWith('(') && value.endsWith(')')) {
			return 'eqn';
		} else {
			return 'MP';
		}
	}

	formatArg(value: number | string) {
		if (typeof value === 'number') {
			const newUnit = unitOptions[this.unit][0];
			return `${(value / unitMultipliers[newUnit]).toFixed(0)}${newUnit}`;
		} else {
			return value;
		}
	}
}

export const re_point_roll = /[1-8](x|X|\*)(2|4|8)/;

export class RollInput {
	checkOption(value: number | string | (number | string)[]) {
		if (typeof value === 'string') {
			return re_point_roll.test(value) ? 'point' : 'MP';
		} else if (Array.isArray(value)) {
			return 'array';
		} else {
			return 'value';
		}
	}

	formatArg(value: number | string | (number | string)[]): string {
		if (Array.isArray(value)) {
			return value.map((v) => this.formatArg(v)).join(',');
		} else if (typeof value === 'number') {
			const newUnit = unitOptions.rad[0];
			return `${(value / unitMultipliers[unitOptions.rad[0]]).toFixed(0)}${newUnit}`;
		} else if (typeof value === 'string') {
			return value;
		}
		return '';
	}
}

export class SelectInput {
	constructor(readonly options: string[]) {}

	formatArg(value: string) {
		return value;
	}
}

export class RollTypeInput {
	formatArg(value: string) {
		return value;
	}
}

export class BooleanInput {
	formatArg(value: boolean) {
		return value;
	}
}

export type Input = RollInput | NumberInput | SelectInput | RollTypeInput | BooleanInput;

const RATESTEP = Math.PI / 20;
const ANGLESTEP = Math.PI / 4;

export const inputMap = {
	speed: new NumberInput('m/s', 1),
	loop_radius: new NumberInput('m', 5),
	line_length: new NumberInput('m', 10),
	point_length: new NumberInput('m', 2),
	partial_roll_rate: new NumberInput('rad/s', RATESTEP),
	full_roll_rate: new NumberInput('rad/s', RATESTEP),
	snap_rate: new NumberInput('rad/s', RATESTEP),
	stallturn_rate: new NumberInput('rad/s', RATESTEP),
	spin_rate: new NumberInput('rad/s', RATESTEP),
	ee_pause: new NumberInput('m', 5),
	length: new NumberInput('m', 10),
	radius: new NumberInput('m', 10),
	rolls: new RollInput(),
	rollangle: new NumberInput('rad', ANGLESTEP),
	pause_length: new NumberInput('m', 5),
	break_angle: new NumberInput('rad', (5 * Math.PI) / 180),
	break_roll: new NumberInput('rad', ANGLESTEP),
	recovery_roll: new NumberInput('rad', ANGLESTEP),
	turns: new NumberInput('rad', 2 * ANGLESTEP),
	angle: new NumberInput('rad', ANGLESTEP),
	partial_rate: new NumberInput('rad/s', RATESTEP),
	full_rate: new NumberInput('rad/s', RATESTEP),
	mode: new SelectInput(['f3a', 'imac']),
	rolltypes: new RollTypeInput(),
	padded: new BooleanInput(),
	reversible: new BooleanInput()
};
