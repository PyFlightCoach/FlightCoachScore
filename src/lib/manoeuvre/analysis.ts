import { States } from '$lib/utils/state';
import { ManDef, ManOpt } from '$lib/manoeuvre/definition.svelte';
import { ManoeuvreResult } from '$lib/manoeuvre/scores';
import { FCJManResult, FCJScore, Origin, ScheduleInfo } from '$lib/flight/fcjson';
import { analysisServer } from '$lib/api/api';
import { selectedResult } from '$lib/stores/analysis';
import { isAnalysisModified } from '$lib/stores/shared';
import { Manoeuvre } from './raw.svelte';
import { objmap } from '$lib/utils/arrays';
import { BinDataState, GlobalState } from '$lib/flight/flight';
import { loadManDef, library } from '$lib/schedule/library';
import {get} from 'svelte/store';


export class MA {
	constructor(
		readonly name: string,
		readonly id: number,
		readonly schedule: ScheduleInfo,
		readonly scheduleDirection: string,
		readonly data: GlobalState | BinDataState,
		readonly mdef: ManDef | ManOpt,
    readonly history: Record<string, FCJManResult> = {},
		readonly manoeuvre: Manoeuvre | undefined = undefined,
		readonly template: States | undefined = undefined,
		readonly corrected: Manoeuvre | undefined = undefined,
		readonly corrected_template: States | undefined = undefined,
		readonly scores: ManoeuvreResult | undefined = undefined,
    readonly runinfo: string = ''
	) {}

  get flown() {
    return this.data.states
  }

  get k () {
    return this.mdef?.info.k || 1;
  }

	summary() {
		return {
			name: this.name,
			id: this.id,
			schedule: this.schedule.to_string(),
			scheduleDirection: this.scheduleDirection,
			k: this.k
		};
	}

	get_score(selectedResult: string, difficulty: number, truncate: boolean) {
		if (!this.history[selectedResult]) {
			return FCJScore.empty();
		} else {
			return (
				this.history[selectedResult].get_score(difficulty, truncate)?.score || FCJScore.empty()
			);
		}
	}

  reset(newmd?: ManDef | ManOpt | undefined) {
    return new MA(
      this.name,
      this.id,
      this.schedule,
      this.scheduleDirection,
      this.data,
      newmd || this.mdef,
      this.history,
    );
  }

	async run(optimise: boolean, reset: boolean) {

		const res = (
			await analysisServer.post('analyse', {
				id: this.id,
				mdef: this.mdef!.dump(),
				optimise_alignment: optimise,
				flown: this.data.data,
				origin: this.data.origin,
				schedule_direction: this.scheduleDirection,
        reset
			})
		).data;
		selectedResult.set(res.fa_version);


		const results = res.els && res.results ? FCJManResult.parse(res) : undefined;
		const isNewFAVersion = !this.history[res.fa_version];
		const isNewSplit = results && !isNewFAVersion
			? !this.history[res.fa_version].compareSplit(results)
			: false;

		if (isNewFAVersion || isNewSplit) {
			isAnalysisModified.set(true);
		}

		return new MA(
			this.name,
			this.id,
			this.schedule,
			this.scheduleDirection,
			new GlobalState(States.parse(res.flown), this.data.origin),
			ManDef.parse(res.mdef),
      { ...this.history, [res.fa_version]: results },
			res.manoeuvre ? Manoeuvre.parse(res.manoeuvre): undefined,
			res.template ? States.parse(res.template) : undefined,
			res.corrected ? Manoeuvre.parse(res.corrected) : undefined,
			res.corrected_template ? States.parse(res.corrected_template) : undefined,
			res.full_scores ? ManoeuvreResult.parse(res.full_scores) : undefined,
      res.info  
		);
	}

	shortExport() {
		return {
			name: this.name,
			id: this.id,
			schedule: this.schedule,
			schedule_direction: this.scheduleDirection,
			flown: this.flown?.data,
			history: this.history
		};
	}

	longExport() {
		return {
			...this.shortExport(),
			mdef: this.mdef?.dump(),
			manoeuvre: this.manoeuvre?.dump(),
			template: this.template!.data,
			corrected: this.corrected?.dump(),
			corrected_template: this.corrected_template?.data,
			scores: this.scores
		};
	}

	static async parse(data: Record<string, any>, origin: Origin) {

    const mdef = data.mdef || await loadManDef(
          get(library).subset({
            category_name: data.schedule.category,
            schedule_name: data.schedule.name
          }).first!.manoeuvres[data.id - 1].id
        );

		return new MA(
			data.name as string,
			data.id,
			Object.setPrototypeOf(data.schedule, ScheduleInfo.prototype),
			data.schedule_direction,
			new GlobalState(States.parse(data.flown), origin),
			mdef,
      data.history ? objmap(data.history, (_, v)=>FCJManResult.parse(v)): undefined,
			data.manoeuvre,
			data.template ? States.parse(data.template) : undefined,
			data.corrected,
			data.corrected_template ? States.parse(data.corrected_template) : undefined,
			data.scores ? ManoeuvreResult.parse(data.scores) : undefined
		);
	}


}


