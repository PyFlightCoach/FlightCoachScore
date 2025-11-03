import { Origin } from '$lib/flight/fcjson';
import { Point } from '$lib/utils/geometry';

export const F3AGround = [
  new Point(259.80762, 150, 0),
  new Point(303.10891, 175, 0),
  new Point(-303.10891, 175, 0),
  new Point(-259.80762, 150, 0),
  new Point(259.80762, 150, 0)
]


export const IMACGround = [
  new Point(300, 50, 0),
  new Point(300, 500, 0),
  new Point(-300, 500, 0),
  new Point(-300, 50, 0),
  new Point(300, 50, 0)
]


export const IACGround = [
  new Point(500, 200, 0),
  new Point(500, 1200, 0),
  new Point(-500, 1200, 0),
  new Point(-500, 200, 0),
  new Point(500, 200, 0)
]

export function drawBoxInWorld(origin: Origin, kind: string) {
  const points = {
    F3A: F3AGround,
    IAC: IACGround,
    IMAC: IMACGround
  }[kind];  
  return points!.map((point) => origin.pilot.offset(origin.rotation.transform_point(point)));
}

export function getPointOnCentre(origin: Origin) {
  return origin.pilot.offset(origin.rotation.transform_point(new Point(0, 300, 0)))
}

export function f3aBoxTrace() {
	const xlim = 175 * Math.tan((60 * Math.PI) / 180);
	const ylim = 175;

	return {
		x: [0, xlim, 0, -xlim, xlim, 0, -xlim],
		y: [0, ylim, ylim, ylim, ylim, ylim, ylim],
		z: [0, 0, 0, 0, xlim, xlim, xlim],
		i: [0, 0, 0, 0, 0],
		j: [1, 2, 1, 3, 4],
		k: [2, 3, 4, 6, 6],
		opacity: 0.4,
		color: 'grey',
		type: 'mesh3d'
	};
};

export function iacBoxTrace() {
  const s= 500;
  const b = 100;
  const t = 1100;
  const f = 200;
  const r = 1200;

  return {
    //  0  1  2   3   4  5   6   7
		x: [s, s, -s, -s, s, s, -s, -s ],
		y: [f, f,  f,  f, r, r,  r,  r ],
		z: [b, t,  t,  b, b, t,  t,  b ],
		i: [0, 0, 0, 1, 3, 3, 3, 3, 4, 4, 2, 2],
		j: [1, 2, 1, 5, 2, 6, 0, 4, 5, 6, 5, 1],
		k: [2, 3, 4, 4, 6, 7, 4, 7, 6, 7, 6, 5],
		opacity: 0.2,
		color: 'grey',
    alphahull: 5,
		type: 'mesh3d'
  }


};