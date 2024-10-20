import { ScheduleInfo, type FCJson, type FCJMan } from '$lib/analysis/fcjson';
import {States} from '$lib/analysis/state';
import { lookupMonotonic } from '$lib/utils/arrays';

export class ManDetails {
	constructor(
		readonly name: string,
		readonly id: number,
		readonly k: number,
		readonly sinfo: ScheduleInfo | undefined = undefined
	) {}
}

export class ManSplit {
	stop: number | undefined;
	constructor(
		readonly name: string,
		readonly sinfo: ScheduleInfo | undefined = undefined,
		readonly id: number | undefined = undefined,
		stop: number | undefined = undefined
	) {
		this.stop = stop;
	}

	static TakeOff(id=0, stop=undefined) {
		return new ManSplit('Takeoff', undefined, id, stop);
	}
	static Break(id=undefined, stop=undefined) {
		return new ManSplit('Break', undefined, id, stop);
	}
	static Landing(id=18, stop=undefined) {
		return new ManSplit('Landing', undefined, id, stop);
	}
}

export async function parseFCJMans(fcj: FCJson, manDetails: ManDetails[], states: States) {
  const stTime = states.t;
  return fcj.mans.map((man: FCJMan, i: number) => {

    const stStop = lookupMonotonic(fcj.data[man.stop].time/1e6, stTime);
		switch (i) {
			case 0:
				return new ManSplit('Takeoff', undefined, i, stStop);
			case fcj.mans.length - 1:
				return new ManSplit('Landing', undefined, i, stTime.length);
			default:
				return new ManSplit(
					manDetails[i - 1].name,
					manDetails[i - 1].sinfo,
					i,
					stStop
				);
		}

	});
}
