import { Point, Quaternion, GPS } from '$lib/utils/geometry';
import { FCJson, Origin } from '$lib/flight/fcjson';
import { BinField } from '$lib/flight/bin/bindata';


export interface IState {
  t: number,
  dt: number,
  x: number,
  y: number,
  z: number,
  rw: number,
  rx: number,
  ry: number,
  rz: number,
  u: number | undefined,
  v: number | undefined,
  w: number | undefined,
  p: number | undefined,
  q: number | undefined,
  r: number | undefined,
  du: number | undefined,
  dv: number | undefined,
  dw: number | undefined,
  manoeuvre?: string | undefined,
  element?: string | undefined,
}


export class State{
  t: number=0;
  dt: number=0;
  x: number=0;
  y: number=0;
  z: number=0;
  rw: number=0;
  rx: number=0;
  ry: number=0;
  rz: number=0;
  u: number | undefined;
  v: number | undefined;
  w: number | undefined;
  p: number | undefined;
  q: number | undefined;
  r: number | undefined;
  du: number | undefined;
  dv: number | undefined;
  dw: number | undefined;
  manoeuvre?: string | undefined;
  element?: string | undefined;
	constructor(
    t: number=0,
    dt: number=0.04,
    x: number=0,
    y: number=0,
    z: number=0,
    rw: number=0,
    rx: number=0,
    ry: number=0,
    rz: number=0,
    u: number | undefined,
    v: number | undefined,
    w: number | undefined,
    p: number | undefined,
    q: number | undefined,
    r: number | undefined,
    du: number | undefined,
    dv: number | undefined,
    dw: number | undefined,
    manoeuvre?: string | undefined,
    element?: string | undefined,
  ) {
    this.t = t;
    this.dt = dt;
    this.x = x;
    this.y = y;
    this.z = z;
    this.rw = rw;
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
    this.u = u;
    this.v = v;
    this.w = w;
    this.p = p;
    this.q = q;
    this.r = r;
    this.du = du;
    this.dv = dv;
    this.dw = dw;
    this.manoeuvre = manoeuvre;
    this.element = element;
	}

  static parse(data: IState) {
    return new State(
      data.t,
      data.dt,
      data.x,
      data.y,
      data.z,
      data.rw,
      data.rx,
      data.ry,
      data.rz,
      data.u,
      data.v,
      data.w,
      data.p,
      data.q,
      data.r,
      data.du,
      data.dv,
      data.dw,
      data.manoeuvre,
      data.element
    );
  }

  dump() {
    return {
      t: this.t,
      dt: this.dt,
      x: this.x,
      y: this.y,
      z: this.z,
      rw: this.rw,
      rx: this.rx,
      ry: this.ry,
      rz: this.rz,
      u: this.u,
      v: this.v,
      w: this.w,
      p: this.p,
      q: this.q,
      r: this.r,
      du: this.du,
      dv: this.dv,
      dw: this.dw,
      manoeuvre: this.manoeuvre,
      element: this.element
    } as IState;
  }

	get pos() {
		return new Point(this.x, this.y, this.z);
	}
	get att() {
		return new Quaternion(this.rw, this.rx, this.ry, this.rz);
	}
	get vel() {
		return new Point(this.u!, this.v!, this.w!);
	}
	get rvel() {
		return new Point(this.p!, this.q!, this.r!);
	}
	get acc() {
		return new Point(this.du!, this.dv!, this.dw!);
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

  transform(pos: Point, att: Quaternion) {
    const newpos = att.transform_point(this.pos).offset(pos);
    const newatt = Quaternion.mul(att, this.att);
    return State.parse({
      ...this,
      x: newpos.x,
      y: newpos.y,
      z: newpos.z,
      rw: newatt.w,
      rx: newatt.x,
      ry: newatt.y,
      rz: newatt.z
    });
  

  }

}

export class States {
	data: State[];
	constructor(data: State[]) {
		this.data = data;
	}

	static parse(data: IState[] | {data: IState[]}): States {
		return new States((Array.isArray(data) ? data : data.data).map((st) => State.parse(st)));
	}

  static read_csv(data: string) {
    let cols: string[];
    const sts: State[] = [];

    data.split('\n').forEach((line: string) => {
      if (!cols) {
        cols = line.split(',');
      } else {
        sts.push(
          State.parse(
            Object.fromEntries(
              line.split(',').map((val, i) => [cols[i], Number(val)])
            ) as unknown as IState
          )
        );
      }
    });
    return new States(sts.slice(0, sts.length - 1));
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

  get dt() {
    return this.data.map((state) => state.dt );
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

  get first() {
    return this.data[0];
  }

  get last() {
    return this.data[this.data.length - 1];
  }

  shift(offset: Point) {
    return new States(
			this.data.map((st) => {
				return State.parse({
					...st,
					x: st.x + offset.x,
					y: st.y + offset.y,
					z: st.z + offset.z
				});
			})
		);
  }

	move(start: Point) {
		const offset = Point.distance(this.pos[0], start);
		return this.shift(offset);
	}

  transform(pos: Point, att: Quaternion) {
    return new States(
      this.data.map((st) => st.transform(pos, att))
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
				State.parse({
					t: xkf1.time_boot_s[i] as number,
					x: posbox.x + shift.x,
					y: posbox.y + shift.y,
					z: posbox.z + shift.z,
					rw: attbox.w,
					rx: attbox.x,
					ry: attbox.y,
					rz: attbox.z
				} as IState)
			);
		}
		return new States(sts);
	}

	static from_fcj(fcj: FCJson) {
		const box_rot = Quaternion.parse_euler(
			new Point(Math.PI, 0, fcj.origin.heading * Math.PI / 180 + Math.PI / 2)
		);

    const shift = new Point(fcj.parameters.moveEast, -fcj.parameters.moveNorth, 0);
  
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
				const st = State.parse({
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
				} as IState);
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

  plotRange(col: 'x' | 'y' | 'z', zero: boolean = false, pad: number = 0) {
    const cmin = Math.min(...this.data.map((st) => st[col])) - pad;
    const cmax = Math.max(...this.data.map((st) => st[col])) + pad;
    if (zero) {
      return [Math.min(0-pad, cmin), Math.max(0+pad, cmax)];
    } else {
      return [cmin, cmax];
    }
    

  }

	split() {
		const states: Record<string, States> = {};
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

export function state_multi(state: State[], cols: string[], func: (state: State[], col: string) => number) {
	const ranges: Record<string, number> = {};
	cols.forEach((col) => {
		ranges[col] = func(state, col);
	});
	return ranges;
}

export function split_states(state: State[], col: string) {
	const states: Record<string, State[]> = {};
	state.forEach((st) => {
		if (st[col] in states) {
			states[st[col]].push(st);
		} else {
			states[st[col]] = [st];
		}
	});
	return states;
}
