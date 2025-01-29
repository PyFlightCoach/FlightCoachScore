

export const heights = ['BTM', 'MID', 'TOP'];
export type Height = (typeof heights)[number];
export const directions = ['UPWIND', 'DOWNWIND', 'CROSS'];
export type Direction = (typeof directions)[number];
export const positions = ['CENTER', 'END'];
export type Position = (typeof positions)[number];
export const orientations = ['UPRIGHT', 'INVERTED'];
export type Orientation = (typeof orientations)[number];
export const headings = ['RTOL', 'LTOR', 'OUTTOIN', 'INTOOUT'];
export type Heading = (typeof headings)[number];

export interface IBoxLocation {
  height: Height | undefined;
  direction: Direction | undefined;
  orientation: Orientation | undefined;
}

export class BoxLocation implements IBoxLocation {
  height: Height | undefined = $state();
  direction: Direction | undefined = $state();
  orientation: Orientation | undefined = $state();
  constructor(
    height: Height | undefined = undefined,
    direction: Direction | undefined = undefined,
    orientation: Orientation | undefined = undefined
  ) {
    this.height = height;
    this.direction = direction;
    this.orientation = orientation;
  }
  static parse(data: IBoxLocation) {
    return new BoxLocation(data.height, data.direction, data.orientation);
  }
}
