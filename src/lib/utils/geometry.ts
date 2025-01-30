import { min, max, sum, mean } from '$lib/utils/arrays';


export class Point {
	constructor(readonly x: number, readonly y: number, readonly z: number) {}

	norm(): Point {
		const fac = 1 / Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
		return new Point(fac * this.x, fac * this.y, fac * this.z);
	}

	length(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
	}

	static dot(a: Point, b: Point): number {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	static cross(a: Point, b: Point): Point {
		return new Point(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
	}

	mul(val: number | Point): Point {
		if (typeof val == 'number') {
			return new Point(val * this.x, val * this.y, val * this.z);
		} else if (typeof val == typeof this) {
			return new Point(val.x * this.x, val.y * this.y, val.z * this.z);
		} else {
			throw new Error('Invalid type for Point.mul');
		}
	}

	div(val: number | Point) {
		if (typeof val == 'number') {
			return new Point(this.x / val, this.y / val, this.z / val);
		} else if (typeof val == typeof this) {
			return new Point(this.x / val.x, this.y / val.x, this.z / val.z);
		} else {
			throw new Error('Invalid');
		}
	}

	static add(a: Point, b: Point): Point {
		return new Point(a.x + b.x, a.y + b.y, a.z + b.z);
	}

	offset(other: Point): Point {
		return Point.add(this, other);
	}

	static sum(ps: Point[]): Point {
		return new Points(ps).sum();
	}

	static distance(a: Point, b: Point) {
		return new Point(b.x - a.x, b.y - a.y, b.z - a.z);
	}

	cos(): Point {
		return new Point(Math.cos(this.x), Math.cos(this.y), Math.cos(this.z));
	}

	sin(): Point {
		return new Point(Math.sin(this.x), Math.sin(this.y), Math.sin(this.z));
	}
}

export class Points {
	data: Point[] = [];
	constructor(data: Point[]) {
		this.data = data;
	}
	get x() {
		return this.data.map((p) => p.x);
	}
	get y() {
		return this.data.map((p) => p.y);
	}
	get z() {
		return this.data.map((p) => p.z);
	}
	mean() {
		return new Point(mean(this.x), mean(this.y), mean(this.z));
	}
	norm() {
		return this.data.map((p) => p.norm());
	}
	get length() {
		return this.data.map((p) => p.length());
	}
	min() {
		return new Point(min(this.x), min(this.y), min(this.z));
	}
	max() {
		return new Point(max(this.x), max(this.y), max(this.z));
	}
	range() {
		return new Points([this.min(), this.max()]);
	}
	sum() {
		return new Point(sum(this.x), sum(this.y), sum(this.z));
	}

	static concat(ps: Points[]) {
		const ops: Point[] = [];
		ps.forEach((p) => ops.push(...p.data));
		return new Points(ops);
	}
}

export class Quaternion {
	constructor(readonly w: number, readonly x: number,readonly  y: number,readonly  z: number) {}

	axis(): Point {
		return new Point(this.x, this.y, this.z);
	}

	static mul(a: Quaternion, b: Quaternion): Quaternion {
		const pa = a.axis();
		const pb = b.axis();
		const w = a.w * b.w - Point.dot(pa, pb);
		const xyz = Point.sum([pb.mul(a.w), pa.mul(b.w), Point.cross(pa, pb)]);
		return new Quaternion(w, xyz.x, xyz.y, xyz.z);
	}

	norm(): Quaternion {
		const fac = 1 / Math.sqrt(this.w ** 2 + this.x ** 2 + this.y ** 2 + this.z ** 2);
		return new Quaternion(fac * this.w, fac * this.x, fac * this.y, fac * this.z);
	}

	conjugate(): Quaternion {
		return new Quaternion(this.w, -this.x, -this.y, -this.z);
	}

	inverse(): Quaternion {
		return this.conjugate().norm();
	}

	transform_point(p: Point): Point {
		return Quaternion.mul(
			this,
			Quaternion.mul(new Quaternion(0, p.x, p.y, p.z), this.inverse())
		).axis();
	}

	static parse_euler(eul: Point): Quaternion {
		const half = eul.mul(0.5);
		const c = half.cos();
		const s = half.sin();

		return new Quaternion(
			c.y * c.z * c.x + s.y * s.z * s.x,
			c.y * c.z * s.x - s.y * s.z * c.x,
			s.y * c.z * c.x + c.y * s.z * s.x,
			c.y * s.z * c.x - s.y * c.z * s.x
		);
	}
}

const LOCFAC = 111318.84502145034;
export class GPS {
	constructor(
		readonly lat: number,
		readonly lon: number,
		readonly alt: number
	) {}
	static parse(data: Record<string, number>) {
		return new GPS(data.lat, data.lon, data.alt);
	}
	static parse_arr(data: Record<string, number>[]) {
		return data.map((gps) => GPS.parse(gps));
	}
	offset(pin: Point) {
		const latb = this.lat + pin.x / LOCFAC;

		return new GPS(
			latb,
			this.lon + pin.y / (LOCFAC * Math.max(Math.cos((latb * Math.PI) / 180), 0.01)),
			this.alt - pin.z
		);
	}

	static sub(a: GPS, b: GPS) {
		return new Point(
			(a.lat - b.lat) * LOCFAC,
			(a.lon - b.lon) * LOCFAC * Math.max(Math.cos((a.lat * Math.PI) / 180), 0.01),
			b.alt - a.alt
		);
	}
}
