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

	let name: string | undefined = $state(stage?.summary.name || `Stage ${(parent?.summary.children?.length || 0) + 1}`);
	let comment: string | undefined = $state(stage?.summary.comment || undefined);
	let result_rules = $state((stage?.summary.result_rules || {}) as ResultRule);
  let flight_rules = $state((stage?.summary.flight_rules || {}) as FlightRule);
</script>

<div class="col">
  <small>{#if !stage}Create{:else}Edit{/if} Stage</small>
	<TextInput name="Name" bind:value={name} />
	<ResultRules
		oldRule={{ normalise_best_to_n: 1000 } as ResultRule}
		bind:newRule={result_rules}
		showChanges={false}
		whatAmI="Stage"
	/>
  <FlightRules
    oldRule={{ } as FlightRule}
    bind:newRule={flight_rules}
    showChanges={false}
  />
	<div class="row">
		{#if !stage}
			<button
				class="col btn btn-primary mt-2"
				disabled={!name}
				onclick={() => {
					parent!
						.addChild({
							name,
							comment,
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
				class="col btn btn-primary mt-2"
				onclick={() => {
					stage
						.update({
							name,
							comment,
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
</div>
