import { type Position, type IBoxLocation, BoxLocation} from '$lib/manoeuvre/positioning.svelte'; 


export interface IManInfo {
	name: string | undefined;
	short_name: string;
	k: number | undefined;
	position: Position | undefined;
	start: IBoxLocation;
	end: IBoxLocation;
	centre_points: number[];
	centred_els: [number, number][];
}

export class ManInfo implements ManInfo {
	name: string | undefined = $state();
	short_name: string = $state('New');
	k: number | undefined = $state();
	position: Position | undefined = $state();
	start: BoxLocation = $state(new BoxLocation());
	end: BoxLocation = $state(new BoxLocation());
	centre_points: number[] = $state([]);
	centred_els: [number, number][] = $state([]);
	constructor(
		name: string | undefined = undefined,
		short_name: string = 'New',
		k: number | undefined = undefined,
		position: Position | undefined = undefined,
		start: BoxLocation = new BoxLocation(),
		end: BoxLocation = new BoxLocation(),
		centre_points: number[] = [],
		centred_els: [number, number][] = []
	) {
		this.name = name;
		this.short_name = short_name;
		this.k = k;
		this.position = position;
		this.start = start;
		this.end = end;
		this.centre_points = centre_points;
		this.centred_els = centred_els;
	}

	static parse(data: IManInfo) {
		return new ManInfo(
			data.name,
			data.short_name,
			data.k,
			data.position,
			BoxLocation.parse(data.start),
			BoxLocation.parse(data.end),
			data.centre_points,
			data.centred_els
		);
	}

  dump() {
    return {
      name: this.name,
      short_name: this.short_name,
      k: this.k,
      position: this.position,
      start: this.start.dump(),
      end: this.end.dump(),
      centre_points: this.centre_points,
      centred_els: this.centred_els
    } as IManInfo;
  }

}
