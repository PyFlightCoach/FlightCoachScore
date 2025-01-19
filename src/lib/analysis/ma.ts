import { States } from '$lib/analysis/state';
import { Manoeuvre } from '$lib/schedules/manoeuvre';
import { ManDef, ManOpt } from '$lib/schedules/mandef';
import { ManoeuvreResult } from '$lib/schedules/scores';
import { FCJManResult, FCJScore, ScheduleInfo } from '$lib/analysis/fcjson';
import { analysisServer } from '$lib/api';
import { selectedResult, runInfo, binData, origin } from '$lib/stores/analysis';
import { get } from 'svelte/store';
import { isAnalysisModified } from '$lib/stores/shared';

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
		readonly scores: ManoeuvreResult | undefined = undefined
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

	async run(optimise: boolean ) {    
    
		try {
			const res = (await analysisServer.post(
				'analyse',
				{
					id: this.id,
          mdef: this.mdef instanceof ManDef ? this.mdef : this.mdef!.options,
					optimise_alignment: optimise,
					flown: this.flown?.data || get(binData)!.slice(this.tStart, this.tStop),
					origin: get(origin),
					schedule_direction: this.scheduleDirection,
				},
			)).data;
			selectedResult.set(res.fa_version);
			runInfo[this.id - 1].set(res.info);

      const results = FCJManResult.parse(res);
      const isNewFAVersion = !this.history[res.fa_version];
      const isNewSplit = !isNewFAVersion ? !this.history[res.fa_version].compareSplit(results) : false

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
				Manoeuvre.parse(res.manoeuvre),
				States.parse(res.template),
				res.corrected ? Manoeuvre.parse(res.corrected) : undefined,
				res.corrected_template ? States.parse(res.corrected_template) : undefined,
				res.full_scores ? ManoeuvreResult.parse(res.full_scores) : undefined
			);
		} catch (err) {
			runInfo[this.id - 1].set(`Analysis Failed: ${err.message}`);
			console.trace();
			return this;
		}
	}

	shortExport() {
		return {
			name: this.name,
			id: this.id,
			schedule: this.schedule,
			schedule_direction: this.scheduleDirection,
			flown: this.flown!.data,
			history: this.history
		};
	}

	longExport() {
		return {
			...this.shortExport(),
			mdef: this.mdef,
			manoeuvre: this.manoeuvre,
			template: this.template!.data,
			corrected: this.corrected,
			corrected_template: this.corrected_template!.data,
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
			data.manoeuvre ? Manoeuvre.parse(data.manoeuvre) : undefined,
			data.template ? States.parse(data.template) : undefined,
			data.corrected ? Manoeuvre.parse(data.corrected) : undefined,
			data.corrected_template ? States.parse(data.corrected_template) : undefined,
			data.scores ? ManoeuvreResult.parse(data.scores) : undefined
		);
	}
}
