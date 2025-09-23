import { States } from '$lib/utils/state';
import { ManDef, ManOpt } from '$lib/manoeuvre/definition.svelte';
import { ManoeuvreResult } from '$lib/manoeuvre/scores';
import { FCJManResult, FCJScore, ScheduleInfo } from '$lib/flight/fcjson';
import { analysisServer } from '$lib/api/api';
import { selectedResult, binData, origin } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { isAnalysisModified } from '$lib/stores/shared';
import { Manoeuvre } from './raw.svelte';

export class MA {
	constructor(
		readonly name: string,
		readonly id: number,
		readonly tStart: number,
		readonly tStop: number,
		readonly schedule: ScheduleInfo,
		readonly scheduleDirection: string,
		readonly history: Record<string, FCJManResult> = {},
		readonly k: number | undefined = undefined,
		readonly flown: States | undefined = undefined,
		readonly mdef: ManDef | ManOpt | undefined = undefined,
		readonly manoeuvre: Manoeuvre | undefined = undefined,
		readonly template: States | undefined = undefined,
		readonly corrected: Manoeuvre | undefined = undefined,
		readonly corrected_template: States | undefined = undefined,
		readonly scores: ManoeuvreResult | undefined = undefined,
    readonly runinfo: string = ''
	) {}

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
      this.tStart,
      this.tStop,
      this.schedule,
      this.scheduleDirection,
      this.history,
      this.k,
      this.flown,
      newmd || this.mdef,
    );
  }

	async run(optimise: boolean, reset: boolean) {

		const res = (
			await analysisServer.post('analyse', {
				id: this.id,
				mdef: this.mdef!.dump(),
				optimise_alignment: optimise,
				flown: this.flown?.data || get(binData)!.slice(this.tStart, this.tStop),
				origin: get(origin),
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
			this.tStart,
			this.tStop,
			this.schedule,
			this.scheduleDirection,
			{ ...this.history, [res.fa_version]: results },
			res.mdef.info.k,
			States.parse(res.flown),
			ManDef.parse(res.mdef),
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
			flown: this.flown?.data || get(binData)!.slice(this.tStart, this.tStop),
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

	static async parse(data: Record<string, any>) {
		return new MA(
			data.name,
			data.id,
			data.flown[0].t,
			data.flown[data.flown.length - 1].t,
			Object.setPrototypeOf(data.schedule, ScheduleInfo.prototype),
			data.schedule_direction,
			Object.fromEntries(
				Object.entries(data.history).map(([k, v]) => {
					return [k, FCJManResult.parse(v)];
				})
			),
			data.mdef?.info.k,
			data.flown ? States.parse(data.flown) : undefined,
			data.mdef ? ManDef.parse(data.mdef) : undefined,
			data.manoeuvre,
			data.template ? States.parse(data.template) : undefined,
			data.corrected,
			data.corrected_template ? States.parse(data.corrected_template) : undefined,
			data.scores ? ManoeuvreResult.parse(data.scores) : undefined
		);
	}
}
