<script lang="ts">
	import type { ResultRule } from '$lib/api/DBInterfaces/competition';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import type { ContestManager } from '../compthings/ContestManager';

	let {
		parent = undefined,
		compThing = undefined,
		newRule = $bindable(),
		disabled = $bindable(),
		showChanges = true,
    onchange = () => {}
	}: {
		parent?: ContestManager | undefined;
		compThing?: ContestManager | undefined;
		newRule: ResultRule;
		disabled?: boolean;
		showChanges?: boolean;
    onchange?: (rule: ResultRule) => void;
	} = $props();

	const oldRule = compThing?.summary.result_rules as ResultRule | undefined;

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 && showChanges ? 'bg-warning' : '';
	}

	function getNormalisation(rule: ResultRule | undefined) {
		return rule?.normalise_best_to_n ? 'best' : rule?.normalise_average_to_n ? 'average' : 'raw';
	}
	function getNormaliseTo(rule: ResultRule | undefined) {
		return rule?.normalise_best_to_n || rule?.normalise_average_to_n || 1000;
	}
	let normalisation: string = $state(getNormalisation(oldRule) || '');
	let normalise_to: number = $state(getNormaliseTo(oldRule));
	let progressTopN: number | undefined = $state(oldRule?.progress_top_n || undefined);
	let useTopN: number | undefined = $state(oldRule?.use_top_n || undefined);
	let restartScoring: boolean | undefined = $state(oldRule?.restart_scoring || undefined);

	let scoreFromStage: boolean = $state(Number.isInteger(oldRule?.score_from_stage_n));
	let scoreFromStageN: number | undefined = $state(
		Number.isInteger(oldRule?.score_from_stage_n) ? oldRule?.score_from_stage_n! : undefined
	);

  $effect(() => {
		newRule = {
			normalise_best_to_n: normalisation === 'best' ? normalise_to : null,
			normalise_average_to_n: normalisation === 'average' ? normalise_to : null,
			progress_top_n: progressTopN || null,
			use_top_n: useTopN || null,
			restart_scoring: restartScoring !== undefined ? restartScoring : null,
			score_from_stage_n: scoreFromStage ? scoreFromStageN : null
		};
	});

  $effect(() => {
    onchange(newRule);});

</script>

<div
	class="row mb-2 {hasChanged(normalisation, getNormalisation(oldRule))}"
	title="Select how scores are to be normalised, this applies to the final result of this {compThing
		?.summary.what_am_i}."
>
	<label class="col col-form-label text-nowrap" for="normOption">Normalisation:</label>
	<select
		class="col col-form-input form-select"
		id="normOption"
		bind:value={normalisation}
		{disabled}
	>
		<option value="raw">Raw Score</option>
		<option value="best">Best Score</option>
		<option value="average">Average Score</option>
	</select>
</div>
{#if normalisation != 'raw'}
	<div class="row mb-2 {hasChanged(normalise_to, getNormaliseTo(oldRule))}">
		<label class="col col-form-label" for="normTo">Normalise to:</label>
		<input
			class="col form-control"
			type="number"
			id="normTo"
			bind:value={normalise_to}
			{disabled}
		/>
	</div>
{/if}
{#if parent?.summary.what_am_i === 'Competition'}
	<div class="row mb-2 {hasChanged(progressTopN, oldRule?.progress_top_n)}">
		<label class="col col-form-label" for="progressTopN">Progress top n:</label>
		<input
			class="col form-control"
			type="number"
			id="progressTopN"
			bind:value={progressTopN}
			{disabled}
		/>
	</div>
	<div class="row mb-2 {hasChanged(useTopN, oldRule?.use_top_n)}">
		<label class="col col-form-label" for="useTopN">Use top n:</label>
		<input class="col form-control" type="number" id="useTopN" bind:value={useTopN} {disabled} />
	</div>
	<CheckInput
		name="Restart scoring from this stage"
		bind:checked={restartScoring}
		{disabled}
		classappend={hasChanged(restartScoring, oldRule?.restart_scoring)}
		title="If checked, all previous stages will be ignored and scoring will restart from this stage for those that have made the cut."
	/>
{/if}
{#if parent?.summary.what_am_i === 'Stage'}
	<CheckInput
		name="Score from previous stage"
    title="Make this round use the results from a previous stage."
		bind:checked={scoreFromStage}
		{disabled}
		classappend={hasChanged(scoreFromStage, Number.isInteger(oldRule?.score_from_stage_n))}
	/>
	{#if scoreFromStage}
		<div
			class="row mb-2 {hasChanged(scoreFromStageN, oldRule?.score_from_stage_n)}"
			title="Select a previous stage to take scores from."
		>
			<label class="col col-form-label text-nowrap" for="normOption">Select Stage:</label>
			<select
				class="col col-form-input form-select"
				id="normOption"
				bind:value={scoreFromStageN}
				{disabled}
			>
				{#each parent!.competition!.children.filter((s) => s.summary.index < parent!.summary.index) || [] as prevStage, i}
					<option value={prevStage.summary.index}>{prevStage.summary.name}</option>
				{/each}
			</select>
		</div>
	{/if}
{/if}
