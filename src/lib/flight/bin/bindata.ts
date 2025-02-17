import { lookupMonotonic } from '$lib/utils/arrays';
import {GPS} from '$lib/utils/geometry';


export class BinField {
	constructor(data: Record<string, number[]>) {
		return Object.setPrototypeOf(
      Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.from(v)])),
      BinField.prototype
    );
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

	col(name: string, core: number | undefined = undefined): BinField {
		const cols = this.getCols(name).sort();
		return core && cols.includes(`${name}[${core}]`) ? this[`${name}[${core}]` as keyof BinData] : this[cols[0]];
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

  get gpa() {
    return this.col('GPA');
  }

  get rcin() {
    return this.col('RCIN');
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

  findOrigin() {
    // find the point where GPA accuracy is below something, ref Artur
    
    let i = 1;
    let ind = -1;
    const HACC = 3;
    while (ind === -1 && i < 8) {
        ind = this.gpa.HAcc.findIndex( (e) => e.HAcc < (HACC * i) && e.HAcc > 0.1  );
        i++;
    }
    if (ind === -1) throw new Error(`No suitable origin found in GPS`);

    const gpsindex = lookupMonotonic(this.gpa.t[ind], this.gps.t);

    return new GPS(this.gps.Lat[gpsindex], this.gps.Lng[gpsindex], this.gps.Alt[gpsindex]);
  }


}