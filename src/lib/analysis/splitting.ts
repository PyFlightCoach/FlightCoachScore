import { ScheduleInfo, type FCJson, type FCJMan } from '$lib/analysis/fcjson';
import { States } from '$lib/analysis/state';
import { loadManoeuvres } from '$lib/stores/analysis';
import { lookupMonotonic } from '$lib/utils/arrays';
import { ManDef, ManOpt } from './mandef';
import { analysisServer } from '$lib/api';

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
	mdef: ManDef | ManOpt | undefined;
	constructor(
		readonly name: string,
		readonly sinfo: ScheduleInfo | undefined = undefined,
		readonly id: number | undefined = undefined,
		stop: number | undefined = undefined
	) {
		this.stop = stop;
		if (this.sinfo && this.name) {
			analysisServer.get(`${sinfo!.category}/${sinfo!.name}/${name}/definition`).then((r) => {
				this.mdef = ManDef.parse(r);
			});
		}
	}

	static TakeOff(id = 0, stop: number | undefined = undefined) {
		return new ManSplit('Takeoff', undefined, id, stop);
	}
	static Break(id: number | undefined = undefined, stop: number | undefined = undefined) {
		return new ManSplit('Break', undefined, id, stop);
	}
	static Landing(id: number | undefined = 18, stop: number | undefined = undefined) {
		return new ManSplit('Landing', undefined, id, stop);
	}
}

export async function parseFCJMans(fcj: FCJson, states: States) {
	const stTime = states.t;
	const sinfo = await fcj.sinfo.to_pfc();
	const manDetails = await loadManoeuvres(sinfo.category, sinfo.name);

	return fcj.mans.map((man: FCJMan, i: number) => {
		const stStop = lookupMonotonic(fcj.data[man.stop].time / 1e6, stTime);
		switch (i) {
			case 0:
				return new ManSplit('Takeoff', undefined, i, stStop);
			case fcj.mans.length - 1:
				return new ManSplit('Landing', undefined, i, stTime.length);
			default:
				return new ManSplit(manDetails[i - 1].name, manDetails[i - 1].sinfo, i, stStop);
		}
	});
}
