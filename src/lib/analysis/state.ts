import { Point, Quaternion, GPS } from '$lib/analysis/geometry';
import { FCJson, Origin } from '$lib/analysis/fcjson';
import { BinField } from '$lib/analysis/bindata';

export class State {
	constructor(data: Record<string, number | string>) {
		return Object.setPrototypeOf(data, State.prototype);
	}

	get pos() {
		return new Point(this.x, this.y, this.z);
	}
	get att() {
		return new Quaternion(this.rw, this.rx, this.ry, this.rz);
	}
	get vel() {
		return new Point(this.u, this.v, this.w);
	}
	get rvel() {
		return new Point(this.p, this.q, this.r);
	}
	get acc() {
		return new Point(this.du, this.dv, this.dw);
	}

	body_to_world(p: Point): Point {
		return this.att.transform_point(p).offset(this.pos);
	}

	direction() {
		return +(this.att.transform_point(new Point(1, 0, 0)).x > 0) * 2 - 1;
	}

	direction_str() {
		return this.direction() > 0 ? 'LTOR' : 'RTOL';
	}
}

export class States {
	data: State[];
	constructor(data: State[]) {
		this.data = data;
	}

	static parse(data: Record<string, number | string>[] | Record<string, Record<string, number | string[]>>): States {
		return new States((data.hasOwnProperty('data') ? data.data : data).map((st) => new State(st)));
	}

	getFCJIndexOffset(minalt = 10) {
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i].z > minalt) {
				return i;
			}
		}
	}

	getFCJLength(minalt = 10) {
		let fcjl = 0;
		this.data.forEach((st) => {
			if (st.z > minalt) {
				fcjl += 1;
			}
		});
		return fcjl;
	}

  get t() {
    return this.data.map((state) => state.t);
  }

	get pos() {
		return this.data.map((state) => state.pos);
	}
	get att() {
		return this.data.map((state) => state.att);
	}
	get vel() {
		return this.data.map((state) => state.vel);
	}
	get rvel() {
		return this.data.map((state) => state.rvel);
	}
	get acc() {
		return this.data.map((state) => state.acc);
	}
	get manoeuvre() {
		return this.data.map((state) => state.manoeuvre);
	}
	get element() {
		return this.data.map((state) => state.element);
	}

	move(start: Point) {
		const offset = Point.distance(this.pos[0], start);
		return new States(
			this.data.map((st, i) => {
				return new State({
					...st,
					x: st.x + offset.x,
					y: st.y + offset.y,
					z: st.z + offset.z
				});
			})
		);
	}

	body_to_world(p: Point) {
		return this.data.map((st) => st.body_to_world(p));
	}
	static from_xkf1(box: Origin, orgn: BinField, xkf1: BinField) {
		const xorg = new GPS(orgn.Lat[0], orgn.Lng[0], orgn.Alt[0]);
		const box_rot = Quaternion.parse_euler(
			new Point(Math.PI, 0, (box.heading * Math.PI) / 180 + Math.PI / 2)
		);
		const box_pos = new GPS(box.lat, box.lng, box.alt);
		let sts = [];
    
    const shift = new Point(box.move_east, -box.move_north, 0);

		for (let i = 0; i < xkf1.length; i++) {
			const posned = GPS.sub(xorg.offset(new Point(xkf1.PN[i], xkf1.PE[i], xkf1.PD[i])), box_pos);
			const att = Quaternion.parse_euler(
				new Point(xkf1.Roll[i], xkf1.Pitch[i], xkf1.Yaw[i]).mul(Math.PI / 180)
			);

			const posbox = box_rot.transform_point(posned);
			const attbox = Quaternion.mul(box_rot, att);

			sts.push(
				new State({
					t: xkf1.time_boot_s[i],
					x: posbox.x + shift.x,
					y: posbox.y + shift.y,
					z: posbox.z + shift.z,
					rw: attbox.w,
					rx: attbox.x,
					ry: attbox.y,
					rz: attbox.z
				})
			);
		}
		return new States(sts);
	}

	static from_fcj(fcj: FCJson) {
		const box_rot = Quaternion.parse_euler(
			new Point(Math.PI, 0, fcj.origin.heading * Math.PI / 180 + Math.PI / 2)
		);

    const shift = new Point(fcj.parameters.moveEast, -fcj.parameters.moveNorth, 0);
    console.log(shift);
		let lastT = fcj.data[0].time / 1e6 - 1 / 25;

		return new States(
			fcj.data.map((row) => {
				const posbox = box_rot.transform_point(new Point(row.N, row.E, row.D));
				const attbox = Quaternion.mul(
					box_rot,
					Quaternion.parse_euler(new Point(row.roll, row.pitch, row.yaw))
				);
				const velbody = attbox
					.inverse()
					.transform_point(box_rot.transform_point(new Point(row.VN, row.VE, row.VD)));
				const st = new State({
					t: row.time / 1e6,
					dt: row.time / 1e6 - lastT,
					x: posbox.x + shift.x,
					y: posbox.y + shift.y,
					z: posbox.z + shift.z,
					rw: attbox.w,
					rx: attbox.x,
					ry: attbox.y,
					rz: attbox.z,
					u: velbody.x,
					v: velbody.y,
					w: velbody.z
				});
				lastT = row.time / 1e6;
				return st;
			})
		);
	}

	slice(start: number, stop: number) {
		return new States(this.data.slice(start, stop));
	}

	range(col: string) {
		return (
			Math.max.apply(
				0,
				this.data.map((st) => st[col])
			) -
			Math.min.apply(
				0,
				this.data.map((st) => st[col])
			)
		);
	}

	split() {
		let states: Record<string, States> = {};
		let last_el = '';
		this.data.forEach((st) => {
			if (st.element in states) {
				states[st.element].data.push(st);
			} else {
				if (last_el != '') {
					states[last_el].data.push(st);
				}
				last_el = st.element;
				states[st.element] = new States([st]);
			}
		});
		return states;
	}

	downsample(n: number) {
		//reduce a list of states to n equally spaced ones, include the first and last ones
		const spacing = Math.floor(this.data.length / (n - 1));
		const sts = [];
		for (let i = 0; i <= n - 2; i++) {
			sts.push(this.data[i * spacing]);
		}
		if (n >= 1) {
			sts.push(this.data[this.data.length - 1]);
		}
		return new States(sts);
	}

	elements() {
		return [...new Set(this.element)];
	}

	end_info() {
		const all_elements = this.element;
		return Object.fromEntries(
			this.elements().map((el) => {
				const lastid = all_elements.lastIndexOf(el);
				const firstid = all_elements.indexOf(el);
				return [
					el,
					{
						lastid,
						lastt: this.data[lastid].t,
						firstid,
						firstt: this.data[firstid].t
					}
				];
			})
		);
	}
}

export function state_range(state: State[], col: string, extend: number = 0) {
	return [
		Math.min.apply(
			0,
			state.map((st) => st[col])
		),
		Math.max.apply(
			0,
			state.map((st) => st[col])
		)
	];
}

export function state_centre(state: State[], col: string) {
	const srange = state_range(state, col);
	return (srange[0] + srange[1]) / 2;
}

export function state_multi(state: State[], cols: string[], func: any) {
	let ranges: Record<string, number> = {};
	cols.forEach((col) => {
		ranges[col] = func(state, col);
	});
	return ranges;
}

export function split_states(state: State[], col: string) {
	let states: Record<string, State[]> = {};
	state.forEach((st) => {
		if (st[col] in states) {
			states[st[col]].push(st);
		} else {
			states[st[col]] = [st];
		}
	});
	return states;
}
