<script lang="ts">
	import type { ResultRule } from '$lib/api/DBInterfaces/competition';

	let {
		oldRule = undefined,
		newRule = $bindable(),
		disabled = $bindable(),
		whatAmI,
		showChanges = true
	}: {
		oldRule?: ResultRule | undefined;
		newRule: ResultRule;
		disabled?: boolean;
		whatAmI: 'Competition' | 'Stage' | 'Round';
		showChanges?: boolean;
	} = $props();

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

	$effect(() => {
		newRule = {
			normalise_best_to_n: normalisation === 'best' ? normalise_to : null,
			normalise_average_to_n: normalisation === 'average' ? normalise_to : null,
			progress_top_n: progressTopN || null,
			use_top_n: useTopN || null
		};
	});
</script>

<div
	class="row p-2 {hasChanged(normalisation, getNormalisation(oldRule))}"
	title="Select how scores are to be normalised, this applies to the final result of this {whatAmI}."
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
	<div class="row p-2 {hasChanged(normalise_to, getNormaliseTo(oldRule))}">
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
{#if whatAmI === 'Stage'}
	<div class="row p-2 {hasChanged(progressTopN, oldRule?.progress_top_n)}">
		<label class="col col-form-label" for="progressTopN">Progress top n:</label>
		<input
			class="col form-control"
			type="number"
			id="progressTopN"
			bind:value={progressTopN}
			{disabled}
		/>
	</div>
	<div class="row p-2 {hasChanged(useTopN, oldRule?.use_top_n)}">
		<label class="col col-form-label" for="useTopN">Use top n:</label>
		<input class="col form-control" type="number" id="useTopN" bind:value={useTopN} {disabled} />
	</div>
{/if}
