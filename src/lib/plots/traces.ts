import { Point, Quaternion} from '$lib/utils/geometry';
import { States } from '$lib/utils/state';
import ObjFile from 'obj-file-parser';
import { d3Color } from '$lib/plots/styling';
import { min } from 'lodash';

export const ribbon = (
	st: States,
	sp: number,
	expandprops: Record<string, any[]> = {},
	props: Record<string, any> = {}
) => {
	const semisp = sp / 2;

	const points: Point[] = [];

	Object.keys(expandprops).forEach((key) => {
		props[key] = [];
	});

	for (let i = 0; i < st.data.length; i++) {
		points.push(st.data[i].body_to_world(new Point(0, semisp, 0)));
		points.push(st.data[i].body_to_world(new Point(0, -semisp, 0)));
	}

	const _i: number[] = [];
	const _j: number[] = [];
	const _k: number[] = [];
	for (let i = 0; i < points.length - 2; i += 2) {
		_i.push(i);
		_j.push(i + 1);
		_k.push(i + 2);
		_i.push(i + 1);
		_j.push(i + 3);
		_k.push(i + 2);

		Object.entries(expandprops).forEach(([key, val]) => {
			props[key].push(val[i]);
			props[key].push(val[i]);
			props[key].push(val[i]);
			props[key].push(val[i]);
		});
	}

	let data: Record<string, number[]> = { x: [], y: [], z: [] };
	points.forEach((val: Record<string, any>) => {
		data.x.push(val.x);
		data.y.push(val.y);
		data.z.push(val.z);
	});

	return { ...data, i: _i, j: _j, k: _k, type: 'mesh3d', ...props };
};

export const coloured_ribbons = (states: Record<string, States>, span: number) => {
	return Object.keys(states).map((el) => {
		return { ...ribbon(states[el], span), name: el };
	});
};


export const plotCorners = (st: States, expand: number = 0, includeZero:boolean=false) => { 
  const r = {
    x: st.plotRange('x', includeZero, expand),
    y: st.plotRange('y', includeZero, expand),
    z: st.plotRange('z', includeZero, expand)
  };

  return {
    type: 'scatter3d',
    mode: 'markers',
    x: [r.x[0], r.x[0], r.x[0], r.x[0], r.x[1], r.x[1], r.x[1], r.x[1]],
    y: [r.y[0], r.y[0], r.y[1], r.y[1], r.y[0], r.y[0], r.y[1], r.y[1]],
    z: [r.z[0], r.z[1], r.z[0], r.z[1], r.z[0], r.z[1], r.z[0], r.z[1]],
    marker: { size: 0, color: 'white', opacity: 0 },
    hoverinfo: 'none',
    showlegend: false,
  };
};

export const vectors = (
	pos: Point[],
	vec: Point[],
	text: string[] | null = null
): Record<string, any>[] => {
	let trs: Record<string, any>[] = [];
	for (let i = 0; i < pos.length; i++) {
		trs.push({
			type: 'scatter3d',
			x: [pos[i].x, pos[i].x + vec[i].x],
			y: [pos[i].y, pos[i].y + vec[i].y],
			z: [pos[i].z, pos[i].z + vec[i].z],
			mode: 'lines',
			line: { color: 'black', width: 2 },
			showlegend: false,
			text: text == null ? '' : text[i]
		});
	}

	return trs;
};

export const single_point = (x = 0, y = 0, z = 0) => {
	return {
		type: 'scatter3d',
		x: [x],
		y: [y],
		z: [z],
		mode: 'markers',
		name: 'pilot position',
		showlegend: false
	};
};

export const points = (pos: Point[], text: string[] | undefined = undefined): Record<string, any>[] => {
	let trs: Record<string, any>[] = [];
	for (let i = 0; i < pos.length; i++) {
		trs.push({
			type: 'scatter3d',
			x: [pos[i].x],
			y: [pos[i].y],
			z: [pos[i].z],
			mode: 'markers' + (text ? '+text' : ''),
			marker: { color: 'black', size: 3 },
			showlegend: false,
			text: text ? text[i] : `point ${i}`
		});
	}

	return trs;
};

export const boxtraces = (kind: "F3A" | "IMAC" | "IAC" = "F3A") => {
  let ymin
  let ymax
  let xmin
  let xmax
  let zmin
  let zmax
  if (kind === "F3A") {
    ymin = 150
    ymax = 175
    xmin = ymin * Math.tan((60 * Math.PI) / 180);
    xmax = ymax * Math.tan((60 * Math.PI) / 180);
    zmin = ymin * Math.tan((15 * Math.PI) / 180);
    zmax = ymax * Math.tan((60 * Math.PI) / 180);
    } else if (kind === "IMAC") {
    ymin = 50;
    ymax = 500;
    xmin = 400;
    xmax = 400;
    zmin = 50;
    zmax = 500; 
  } else {
    ymin = 200;
    ymax = 1200;
    xmin = 500;
    xmax = 500;
    zmin = 200;
    zmax = 1200;
  }

	return [{
    x: [0, -xmin, -xmax, -xmin, -xmax,  xmin,  xmax,  xmin,  xmax],
    y: [0,  ymin,  ymax,  ymin,  ymax,  ymin,  ymax,  ymin,  ymax],
    z: [0,  zmin,  zmin,  zmax,  zmax,  zmin,  zmin,  zmax,  zmax],
    i: [1, 2, 5, 6, 1, 5, 3, 8, 1, 3, 2, 6],
    j: [2, 4, 6, 8, 5, 6, 7, 4, 5, 5, 6, 8],
    k: [3, 3, 7, 7, 2, 2, 8, 3, 3, 7, 4, 4],
    //
//		x: [0, xmax, 0, -xmax, xmax, 0, -xmax],
//		y: [0, ymax, ymax, ymax, ymax, ymax, ymax],
//		z: [0, 0,   0, 0, xmax, xmax, xmax],
//		i: [0, 0, 0, 0, 0],
//		j: [1, 2, 1, 3, 4],
//		k: [2, 3, 4, 6, 6],
		opacity: 0.2,
		color: 'grey',
		type: 'mesh3d',
    hoverinfo: 'none',
    showlegend: false,
	},{
    x: [-xmin, xmin, xmin, -xmin, -xmin, -xmax, xmax, xmin,  xmax, xmax,xmin,xmax,-xmax,-xmin,-xmax, -xmax, -xmax],
    y: [ ymin, ymin, ymin,  ymin,  ymin,  ymax, ymax, ymin,  ymax, ymax,ymin,ymax, ymax, ymin, ymax,  ymax,  ymax],
    z: [ zmin, zmin, zmax,  zmax,  zmin,  zmin, zmin, zmin,  zmin, zmax,zmax,zmax, zmax, zmax, zmax,  zmin,  zmin],
    type: 'scatter3d',
    mode: 'lines',
    line: { color: 'grey', width: 2, opacity: 0.5 },
    showlegend: false,
    hoverinfo: 'none'
  }];
};

export class OBJ {
	vertices: Point[];
	faces: number[][];
	normals: Point[];
	constructor(vertices: Point[], faces: number[][], normals: Point[]) {
		this.vertices = vertices;
		this.faces = faces;
		this.normals = normals;
	}

	static parse_dict(data: OBJ) {
		return new OBJ(
			data.vertices.map((v) => new Point(v.x, v.y, v.z)),
			data.faces,
			data.normals.map((v) => new Point(v.x, v.y, v.z))
		);
	}

	static from_objfile(file: string) {
		const obj = new ObjFile(file).parse();
		const vertices = obj.models[0].vertices.map((v) => new Point(v.x, v.y, v.z));
		const faces = obj.models[0].faces.map((f) => [
			f.vertices[0].vertexIndex,
			f.vertices[1].vertexIndex,
			f.vertices[2].vertexIndex
		]);
		const normals = obj.models[0].vertexNormals.map((v) => new Point(v.x, v.y, v.z));

		return new OBJ(vertices, faces, normals);
	}

	static parse(file: string, offset: Point | null = null, rotate: Quaternion | null = null) {
		const lines = file.split('\n');
		let vertices: Point[] = [];
		const faces: number[][] = [];
		let normals: Point[] = [];

		lines.forEach((line) => {
			const tokens = line.split(' ');
			if (tokens[0] == 'v') {
				vertices.push(
					new Point(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]))
				);
			} else if (tokens[0] == 'f') {
				faces.push(tokens.slice(1).map((t) => parseInt(t) - 1));
			} else if (tokens[0] == 'vn') {
				normals.push(
					new Point(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]))
				);
			}
		});
		if (rotate != null) {
			vertices = vertices.map((v) => rotate.transform_point(v));
			normals.forEach((n) => rotate.transform_point(n));
		}
		if (offset != null) {
			vertices = vertices.map((v) => v.offset(offset));
		}

		return new OBJ(vertices, faces, normals);
	}

	scale(s: number) {
		return new OBJ(
			this.vertices.map((v) => v.mul(s)),
			this.faces,
			this.normals
		);
	}

	to_mesh3d(p: Point, q: Quaternion, props: Record<string, any> = {}) {
		const vertices = this.vertices.map((v) => p.offset(q.transform_point(v)));
		return {
			x: vertices.map((v) => v.x),
			y: vertices.map((v) => v.y),
			z: vertices.map((v) => v.z),
			i: this.faces.map((f) => f[0]),
			j: this.faces.map((f) => f[1]),
			k: this.faces.map((f) => f[2]),
			type: 'mesh3d',
			showscale: false,
			...props,
			//flatshading: true,
			lighting: {
				ambient: 0.5,
				diffuse: 1.0,
				fresnel: 0.2,
				specular: 0.1,
				roughness: 0.1,
				facenormalsepsilon: 1e-6,
				vertexnormalsepsilon: 1e-12
			},
			lightposition: { x: 100, y: 0, z: 1000 }
		};
	}
}

export const modeltrace = (sts: States, model: OBJ, props: Record<string, any> = {}) => {
	return sts.data.map((st) => model.to_mesh3d(st.pos, st.att, props));
};



export const alignment_traces = (
	sts: Record<string, States>,
	showmodels: boolean,
	showbox: boolean,
	obj: OBJ | null,
	nmodels: number,
	hid: number | null
) => {
	const trs = [];

	Object.entries(sts).forEach(([k, v], i) => {
		const props = {
			color: d3Color(i),
			name: k
		};
		if (i == hid || hid == null) {
			if (showmodels && obj != null) {
				trs.push(...modeltrace(v.downsample(nmodels), obj, { opacity: 1.0, ...props }));
			}

			trs.push(ribbon(v, 3, {}, { opacity: 0.8, showlegend: false, ...props }));
		} else {
			trs.push(ribbon(v, 3, {}, { opacity: 0.2, ...props }));
		}
	});

	if (showbox) {
		trs.push(boxtraces());
	}

	return trs;
};
