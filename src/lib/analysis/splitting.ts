import { type FCJson, type FCJMan } from '$lib/analysis/fcjson';
import { States } from '$lib/analysis/state';
import { lookupMonotonic } from '$lib/utils/arrays';
import { ManDef, ManOpt } from './mandef';
import { library } from '$lib/schedules';
import { type Manoeuvre, type Schedule, loadManDef } from '$lib/schedules';

export class ManSplit {
	schedule: Schedule | undefined;
	manoeuvre: Manoeuvre | undefined;
	stop: number | undefined;
	fixed: boolean;
	alternate_name: 'TakeOff' | 'Landing' | 'Break' | undefined;
	mdef: ManDef | ManOpt | undefined;

	constructor(
		schedule: Schedule | undefined,
		manoeuvre: Manoeuvre | undefined = undefined,
		stop: number | undefined = undefined,
		fixed: boolean = false,
		alternate_name: 'TakeOff' | 'Landing' | 'Break' | undefined = undefined
	) {
		this.schedule = schedule;
		this.manoeuvre = manoeuvre;
		this.alternate_name = alternate_name;
		this.stop = stop;
		this.fixed = fixed;
		if (this.manoeuvre) {
			loadManDef(this.manoeuvre.id).then((mdef) => {
				this.mdef = mdef;
			});
		}
	}

	get name() {
		return this.manoeuvre?.short_name || this.alternate_name;
	}

	get schedule_name() {
		return this.schedule?.schedule_name || '';
	}

	static TakeOff(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, stop, true, 'TakeOff');
	}
	static Break(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, stop, false, 'Break');
	}
	static Landing(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, stop, false, 'Landing');
	}

	static Empty(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, stop);
	}
}

export class Splitting {
  constructor(readonly mans: ManSplit[]) {}
  
  get analysisMans() {
    const oMans: number[] = [];
    this.mans.forEach((man, i) => {
      if (man.manoeuvre) {
        oMans.push(i);
      }
    });
    return oMans;
  }
  
  directionDefinition() {
    let ddef;
    const imans = this.analysisMans;
    for (let i = 0; i < imans.length; i++) {
      if (this.mans[imans[i]].mdef!.info.start.direction != 'CROSS') {
        ddef = {direction: this.mans[imans[i]].mdef!.info.start.direction, manid: imans[i]};
        break;
      }
    }
    return ddef!;
  }
  
  get manNames() {
    return this.analysisMans.map(iman=>this.mans[iman].manoeuvre!.short_name);
  }
}



export async function parseFCJMans(fcj: FCJson, states: States) {
	const stTime = states.t;
	const sinfo = await fcj.sinfo.to_pfc();
	const schedule = library[sinfo.category].schedules![sinfo.name];

	return fcj.mans.map((man: FCJMan, i: number) => {
		const stStop = lookupMonotonic(fcj.data[man.stop].time / 1e6, stTime);
		switch (i) {
			case 0:
				return ManSplit.TakeOff(stStop);
			case fcj.mans.length - 1:
				return ManSplit.Landing(stTime.length);
			default:
				return new ManSplit(schedule, schedule.manoeuvres[i - 1], stStop);
		}
	});
}
