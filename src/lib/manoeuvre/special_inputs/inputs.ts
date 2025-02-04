import * as units from '$lib/utils/units';

export type Arg = number | string | (number | string)[] | boolean;

export const equals = (a: Arg[][] | Arg[] | Arg | undefined, b: Arg[][] | Arg[] | Arg | undefined): boolean => {
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			return false;
		}
		return a.every((v, i) => equals(v, b[i]));
	} else {
		return a === b;
	}
};


export const re_eqn = /^\(.\)$/;

export class NumberInput {
  defaultValue=0;
	constructor(
		readonly unit: units.BaseUnit,
		readonly step: number,
    readonly description: string = ''
	) {}

	checkOption(value: number | string | undefined) {
		if (typeof value === 'number' || !value) {
			return 'value';
		} else if (typeof value == 'string' && value.startsWith('(') && value.endsWith(')')) {
			return 'eqn';
		} else {
			return 'MP';
		}
	}

	formatArg(value: number | string) {
		if (typeof value === 'number') {
			const newUnit = units.unitOptions[this.unit][0];
			return `${(value / units.unitMultipliers[newUnit]).toFixed(0)}${newUnit}`;
		} else {
			return value;
		}
	}
}

export const re_point_roll = /[1-8](x|X|\*)(2|4|8)/;

export class RollInput {
  defaultValue=0;
  constructor(readonly description: string = '') {}
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
			const newUnit = units.unitOptions.rad[0];
			return `${(value / units.unitMultipliers[units.unitOptions.rad[0]]).toFixed(0)}${newUnit}`;
		} else if (typeof value === 'string') {
			return value;
		}
		return '';
	}
}

export class SelectInput {
	constructor(readonly options: string[], readonly description: string = '') {}

	formatArg(value: string) {
		return value;
	}
}

export class RollTypeInput {
  constructor(readonly description: string = '') {}
	formatArg(value: string) {
		return value;
	}

  checkValue(value: string) {
    if (value === 'roll' || value === 'snap') {
      return true;
    } else if (value.match(/^(r|s)+$/)) {
      return true;
    } else {
      return false;
    }
  }
}

export class BooleanInput {
  constructor(readonly description: string = '') {}
	formatArg(value: boolean) {
		return value;
	}
}

export type Input = RollInput | NumberInput | SelectInput | RollTypeInput | BooleanInput;

const RATESTEP = Math.PI / 20;
const ANGLESTEP = Math.PI / 4;

export const inputMap = {
	speed: new NumberInput('m/s', 1, "To constrain the speed of the template"),
	loop_radius: new NumberInput('m', 5, "To constrain loop diameters in the manoeuvre"),
	line_length: new NumberInput('m', 10, "To constrain line lengths in the manoeuvre"),
	point_length: new NumberInput('m', 2, "The length of the pause between linked rolls"),
	partial_roll_rate: new NumberInput('rad/s', RATESTEP, "The roll rate for partial rolls (less than 1)"),
	full_roll_rate: new NumberInput('rad/s', RATESTEP, "The roll rate for full rolls (1 or more)"),
  roll_rate: new NumberInput('rad/s', RATESTEP, "The roll rate for full rolls (1 or more)"),
	snap_rate: new NumberInput('rad/s', RATESTEP, "The rate of snap, only effects the template"),
	stallturn_rate: new NumberInput('rad/s', RATESTEP, "The stallturn yaw rate, only effects the template"),
	spin_rate: new NumberInput('rad/s', RATESTEP, "The rate of spin, only effects the template"),
	ee_pause: new NumberInput('m', 5, "The pause length between a roll before or after a figure and the figure"),
	length: new NumberInput('m', 10, "The line length"),
	radius: new NumberInput('m', 10, "The looping radius"),
	rolls: new RollInput("The rolls to be integrated around the loop"),
	rollangle: new NumberInput('rad', ANGLESTEP, "The amount of loop to integrate the rolls around"),
	pause_length: new NumberInput('m', 5, "The length of the pause between linked rolls"),
	break_angle: new NumberInput('rad', (5 * Math.PI) / 180, "The snap break angle to generate in the template (does not affect scoring)"),
	break_roll: new NumberInput('rad', ANGLESTEP, "The roll angle to consider as snap break"),
  nd_turns: new NumberInput('rad', ANGLESTEP, "The rotation to include during the nose drop"),
  recovery_turns: new NumberInput('rad', ANGLESTEP, "The rotation to include during the recovery"),
	recovery_roll: new NumberInput('rad', ANGLESTEP, "The roll angle to consider as recovery in snaps or spins"),
	turns: new NumberInput('rad', 2 * ANGLESTEP, "The number of turns to be performed"),
	angle: new NumberInput('rad', ANGLESTEP, "The amount of loop to be performed"),
	partial_rate: new NumberInput('rad/s', RATESTEP, "The roll rate for partial rolls (less than 1)"),
	full_rate: new NumberInput('rad/s', RATESTEP, "The roll rate for full rolls (1 or more)"),
  rate: new NumberInput('rad/s', RATESTEP, "The rotation rate, only effects the template"),
	mode: new SelectInput(['f3a', 'imac'], "should a pause be included between rolls where the direction is reveresed. If F3A then no pause."),
	rolltypes: new RollTypeInput("Either 'roll' for all rolls, 'snap' for all snaps, or a sequence of 'r' and 's' characters equal in length to the roll array for a combination"),
	padded: new BooleanInput("If true, sections of straight line of equal length before and after the roll will be included."),
	reversible: new BooleanInput("Can the rolls be pefromed in either direction?"),
  ke: new BooleanInput("should the loop initiate about the yaw axis?"),
  yaw_rate: new NumberInput('rad/s', RATESTEP, "The stallturn yaw rate, only effects the template"),
  rollposition: new NumberInput('1', 0.05, "The position of the roll in the loop, 0.5 is half way round"),
};
