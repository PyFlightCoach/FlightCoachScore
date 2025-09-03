<script lang="ts">
	import type { ResultRule } from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import type { R } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js';

	let {
		oldRule = $bindable(),
		newRule = $bindable(),
		disabled = $bindable()
	}: {
		oldRule: ResultRule | null;
		newRule: ResultRule | null;
		disabled: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	let normalisation: string = $state('');
	let normalise_to: number | null = $state(null);
	let progressTopN: number | null = $state(null);
	let useTopN: number | null = $state(null);


  function getNormalisation(rule: ResultRule | null) {
    return rule?.raw_score
			? 'raw'
			: rule?.normalise_best_to_n
				? 'best'
				: rule?.normalise_average_to_n
					? 'average'
					: ''
  }
  function getNormaliseTo(rule : ResultRule | null) {
    return rule?.normalise_best_to_n || rule?.normalise_average_to_n || null;
  }

	let specifyResultRules: boolean = $state(oldRule!==null);

	$effect(() => {
		normalisation=getNormalisation(oldRule);
    normalise_to = getNormaliseTo(oldRule);
    progressTopN = oldRule ? oldRule.progress_top_n : null;
    useTopN = oldRule ? oldRule.use_top_n : null;
  specifyResultRules = oldRule!==null;
	});

	$effect(() => {
		newRule = specifyResultRules
			? {
					normalise_best_to_n: normalisation === 'best' ? normalise_to : null,
					normalise_average_to_n: normalisation === 'average' ? normalise_to : null,
					raw_score: normalisation === 'raw',
					progress_top_n: progressTopN,
					use_top_n: useTopN
				}
			: null;
	});


</script>

<CheckInput
	name="Specify Result Rules Here"
	bind:checked={specifyResultRules}
	{disabled}
	classappend={hasChanged(specifyResultRules, oldRule !== null)}
/>

{#if specifyResultRules}
	<div class="row p-2 {hasChanged(normalisation, getNormalisation(oldRule))}">
		<label class="col col-form-label" for="normOption">Normalisation:</label>
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
