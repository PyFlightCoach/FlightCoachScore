import { lookupMonotonic } from '$lib/utils/arrays';

export class BinField {
	constructor(data: Record<string, number[]>) {
		return Object.setPrototypeOf(data, BinField.prototype);
	}

	get t() {
		return this.time_boot_s || [];
	}

	get length() {
		return this.t.length;
	}

	slice(tStart: number, tEnd: number) {
		const iStart = lookupMonotonic(tStart, this.t, 'before');
		const iEnd = lookupMonotonic(tEnd, this.t, 'after');

		return new BinField(
			Object.fromEntries(Object.entries(this).map(([k, v]) => [k, v.slice(iStart, iEnd + 1)]))
		);
	}
}

export class BinData {
	constructor(data: Record<string, BinField>) {
		return Object.setPrototypeOf(data, BinData.prototype);
	}

	getCols(name: string) {
		return Object.keys(this).filter((key) => key.startsWith(name));
	}

	col(name: string, core: number | undefined = undefined) {
		const cols = this.getCols(name).sort();
		return core && cols.includes(`${name}[${core}]`) ? this[`${name}[${core}]`] : this[cols[0]];
	}

	get xkf1() {
		return this.col('XKF1');
	}

  get xkf2() {
    return this.col('XKF2');
  }

	get orgn() {
		return this.col('ORGN');
	}

	get pos() {
		return this.col('POS');
	}

	get att() {
		return this.col('ATT');
	}

	get imu() {
		return this.col('IMU');
	}

	get gps() {
		return this.col('GPS');
	}

	slice(tStart: number, tEnd: number, keepCols: string[] = ['ORGN', 'PARM']) {
		const allKeepCols = keepCols.map((col) => this.getCols(col)).flat();

		return Object.setPrototypeOf(
			Object.fromEntries(
				Object.entries(this).map(([k, v]) => [
					k,
					allKeepCols.includes(k) ? v : v.slice(tStart, tEnd)
				])
			),
			BinData.prototype
		);
	}

	static parse(data: Record<string, BinField>) {
		return new BinData(
			Object.fromEntries(Object.entries(data).map(([k, v]) => [k, new BinField(v)]))
		);
	}
}
