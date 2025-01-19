
export const Heights = ['BTM', 'MID', 'TOP'] as const;
export const Directions = ['DRIVEN', 'UPWIND', 'DOWNWIND', 'CROSS'] as const;
export const Orientations = ['DRIVEN', 'UPRIGHT', 'INVERTED'] as const;
export const Positions = ['CENTRE', 'END'] as const;
export type Height = (typeof Heights)[number];
export type Direction = (typeof Directions)[number];
export type Orientation = (typeof Orientations)[number];
export type Position = (typeof Positions)[number];

export class BoxLocation {
  constructor(
    readonly height: Height | undefined = undefined,
    readonly direction: Direction | undefined = undefined,
    readonly orientation: Orientation | undefined = undefined,
  ) {}
}

export class ManInfo {
  short_name: string
  k: number | undefined
  name: string | undefined
  position: Position | undefined
  start: BoxLocation | undefined
  end: BoxLocation | undefined
  centre_points: number[] | undefined
  centred_els: number[][] | undefined
  constructor(
    short_name: string,
    k: number | undefined = undefined,
    name: string | undefined = undefined,
    position: Position | undefined = undefined,
    start: BoxLocation | undefined = undefined,
    end: BoxLocation | undefined = undefined,
    centre_points: number[] | undefined = undefined,
    centred_els: number[][] | undefined = undefined,
  ) {
    this.short_name = short_name
    this.name = name
    this.k = k
    this.position = position
    this.start = start
    this.end = end
    this.centre_points = centre_points
    this.centred_els = centred_els
  }

  static parse(data: ManInfo) {
    return new ManInfo(
      data.short_name,
      data.k,
      data.name,
      data.position,
      Object.setPrototypeOf(data.start, BoxLocation.prototype),
      Object.setPrototypeOf(data.end, BoxLocation.prototype),
      data.centre_points,
      data.centred_els
    );
  }

}