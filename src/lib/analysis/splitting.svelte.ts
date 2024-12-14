import { type FCJson, type FCJMan } from '$lib/analysis/fcjson';
import { States } from '$lib/analysis/state';
import { lookupMonotonic } from '$lib/utils/arrays';
import { ManDef, ManOpt } from './mandef';
import { loadManDef, safeGetLibrary } from '$lib/schedules';
import { type DBManoeuvre } from '$lib/database/interfaces';
import { library } from '$lib/schedules';
import { get } from 'svelte/store';

export class ManSplit {
  category_name: string | undefined
  schedule_name: string | undefined
  manoeuvre: DBManoeuvre | undefined
	stop: number | undefined = undefined;
	constructor(
		category_name: string | undefined = undefined,
		schedule_name: string | undefined = undefined,
		manoeuvre: DBManoeuvre | undefined = undefined,
		stop: number | undefined = undefined,
		readonly fixed: boolean = false,
		readonly alternate_name: 'TakeOff' | 'Landing' | 'Break' | undefined = undefined
	) {
    this.category_name = category_name;
    this.schedule_name = schedule_name;
    this.manoeuvre = manoeuvre;
		this.stop = stop;
	}

	next(stop: number | undefined = undefined) {
		switch (this.alternate_name) {
			case undefined:
        if (this.category_name && this.schedule_name && this.manoeuvre) {
          const mans = this.schedule.manoeuvres;
            
          if (this.manoeuvre.index + 1 < mans.length) {
            return Object.assign(new ManSplit(), this, { manoeuvre: mans[this.manoeuvre!.index + 1], stop});
          } else {
            return ManSplit.Landing(stop);
          }
        } else {
          throw new Error('Cannot make next manoeuvre without fully defining previous');
        };
      case 'Landing':
        throw new Error('Landing must be the last manoeuvre');
      case 'TakeOff':
      case 'Break':
        return ManSplit.Empty(stop);    			
		}
	}

  get schedule() {
    return get(library)
      .subset({ category_name: this.category_name!, schedule_name: this.schedule_name! })
      .first;
  }

	get name() {
		return this.manoeuvre?.short_name || this.alternate_name;
	}

	static TakeOff(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, undefined, stop, true, 'TakeOff');
	}
	static Break(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, undefined, stop, false, 'Break');
	}
	static Landing(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, undefined, stop, false, 'Landing');
	}

	static Empty(stop: number | undefined = undefined) {
		return new ManSplit(undefined, undefined, undefined, stop);
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
				ddef = { direction: this.mans[imans[i]].mdef!.info.start.direction, manid: imans[i] };
				break;
			}
		}
		return ddef!;
	}

	get manNames() {
		return this.analysisMans.map((iman) => this.mans[iman].manoeuvre!.short_name);
	}
}

export async function parseFCJMans(fcj: FCJson, states: States) {
	const stTime = states.t;
	const sinfo = await fcj.sinfo.to_pfc();

	const schedule = await safeGetLibrary().then(
		(lib) => lib.subset({ category_name: sinfo.category, schedule_name: sinfo.name }).first
	);

	return fcj.mans.map((man: FCJMan, i: number) => {
		const stStop = lookupMonotonic(fcj.data[man.stop].time / 1e6, stTime);
		switch (i) {
			case 0:
				return ManSplit.TakeOff(stStop);
			case fcj.mans.length - 1:
				return ManSplit.Landing(stTime.length);
			default:
				return new ManSplit(
					schedule.category_name,
					schedule.schedule_name,
					schedule.manoeuvres[i - 1],
					stStop
				);
		}
	});
}
