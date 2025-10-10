<script lang="ts">
	import TextInput from '$lib/components/TextInput.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { setComp } from '$lib/stores/contests';
	import ResultRules from '../rules/ResultRules.svelte';
	import FlightRules from '../rules/FlightRules.svelte';
	import type { ResultRule, FlightRule } from '$lib/api/DBInterfaces/competition';

	let {
		parent,
		stage = undefined,
		oncreated = () => {}
	}: {
		parent?: ContestManager | undefined;
		stage?: ContestManager | undefined;
		oncreated?: () => void;
	} = $props();

	let name: string | undefined = $state(
		stage?.summary.name || `Stage ${(parent?.summary.children?.length || 0) + 1}`
	);
	let result_rules = $state(
		(stage?.summary.result_rules || { normalise_best_to_n: 1000 }) as ResultRule
	);
	let flight_rules = $state((stage?.summary.flight_rules || {}) as FlightRule);

	let disabled = $derived(stage && !stage?.isMyComp);
</script>

<div class="col">
	<small class="row p-2">Stage Settings</small>
	<TextInput name="Name" bind:value={name} {disabled} />
	<ResultRules
		oldRule={result_rules}
		bind:newRule={result_rules}
		showChanges={false}
		whatAmI="Stage"
		{disabled}
	/>
	<FlightRules oldRule={flight_rules} bind:newRule={flight_rules} showChanges={false} {disabled} />
	{#if !disabled}
		<div class="row">
			{#if !stage}
				<button
					class="col btn btn-primary"
					disabled={!name}
					onclick={() => {
						parent!
							.addChild({
								name,
								result_rules,
								flight_rules
							})
							.then(setComp)
							.then(oncreated)
							.catch((error) => {
								alert(
									'Error creating stage: ' + error.response?.data?.detail || error.message || error
								);
							});
					}}>Create</button
				>
			{:else}
				<button
					class="col btn btn-primary"
					onclick={() => {
						stage
							.update({
								name,
								result_rules,
								flight_rules
							})
							.then(setComp)
							.then(oncreated)
							.catch((error) => {
								alert(
									'Error editing stage: ' + error.response?.data?.detail || error.message || error
								);
							});
					}}>Save</button
				>
			{/if}
		</div>
	{/if}
</div>
