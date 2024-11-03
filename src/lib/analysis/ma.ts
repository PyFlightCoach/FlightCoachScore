import { States } from '$lib/analysis/state';
import { Manoeuvre } from '$lib/analysis/manoeuvre';
import { ManDef } from '$lib/analysis/mandef';
import { ManoeuvreResult } from '$lib/analysis/scores';
import { FCJManResult, FCJScore, Origin, ScheduleInfo } from '$lib/analysis/fcjson';
import { analysisServer } from '$lib/api';
import { selectedResult, runInfo, binData, origin, loadManoeuvres } from '$lib/stores/analysis';
import { get } from 'svelte/store';

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
		readonly mdef: ManDef | undefined = undefined,
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
			const res = await analysisServer.post(
				'analyse_manoeuvre',
				{
					name: this.name,
					category: this.schedule.category,
					schedule: this.schedule.name,
					schedule_direction: this.scheduleDirection,
					flown: this.flown?.data || get(binData)!.slice(this.tStart, this.tStop),
					origin: get(origin) || new Origin(0,0,0,0),
					optimise_alignment: optimise
				},
			);
			selectedResult.set(res.fa_version);
			runInfo[this.id - 1].set(res.info);
			return new MA(
				this.name,
				this.id,
				this.tStart,
				this.tStop,
				this.schedule,
				this.scheduleDirection,
				{ ...this.history, [res.fa_version]: FCJManResult.parse(res) },
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
		runInfo[data.id - 1].set(`Analysis Imported at ${new Date().toLocaleTimeString()}`);

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
			data.mdef?.info.k ||
				(await loadManoeuvres(data.schedule.category, data.schedule.name))[data.id - 1].k,
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
