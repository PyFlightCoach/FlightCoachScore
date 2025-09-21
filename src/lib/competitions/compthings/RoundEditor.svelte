<script lang="ts">
	import TextInput from '$lib/components/TextInput.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { setComp } from '$lib/stores/contests';
	import ResultRules from '../rules/ResultRules.svelte';
	import AddRules from '../rules/AddRules.svelte';
	import type { ResultRule, AddRule } from '$lib/competitions/compInterfaces';
	import { library } from '$lib/schedule/library';
	let {
    competition = undefined,
		parent = undefined,
		round = undefined,
		oncreated = () => {}
	}: {
    competition?: ContestManager | undefined;
		parent?: ContestManager | undefined;
		round?: ContestManager | undefined;
		oncreated?: () => void;
	} = $props();

	let name: string | undefined = $state(round?.summary.name || `Round ${(parent?.summary.children?.length || 0) + 1}`);
	let comment: string | undefined = $state(round?.summary.comment || undefined);
	let result_rules = $state((round?.summary.result_rules || {}) as ResultRule);
	let add_rules = $state((round?.summary.add_rules || {}) as AddRule);

	let schedules = $derived(
		$library.subset({ category_id: competition?.summary.category_id || undefined })
	);

	let schedule = $state(
		round?.summary.schedule_id
			? schedules.subset({ schedule_id: round?.summary.schedule_id! }).first || undefined
			: undefined
	);

</script>

<div class="col">
  <small>{#if !round}Create{:else}Edit{/if} Round</small>
	<TextInput name="Name" bind:value={name} />

	<div class="row">
		<label for="categorySelect" class="col col-form-label">Select Schedule:</label>
		<select class="col form-select col-form-input" id="categorySelect" bind:value={schedule}>
			{#each schedules.schedules as schedule}
				<option value={schedule}>{schedule.schedule_name}</option>
			{/each}
		</select>
	</div>
	<AddRules
		oldRule={round?.summary.add_rules}
		bind:newRule={add_rules}
		showChanges={round != undefined}
		whatAmI="Round"
	/>

	<ResultRules
		oldRule={{ normalise_best_to_n: 1000 } as ResultRule}
		bind:newRule={result_rules}
		showChanges={false}
		whatAmI="Round"
	/>
	<div class="row">
		{#if !round}
			<button
				class="col btn btn-primary mt-2"
				disabled={!name}
				onclick={() => {
					parent!
						.addChild({
							name,
							comment,
							result_rules,
              schedule_id: schedule?.schedule_id
						})
						.then(setComp)
						.then(oncreated)
						.catch((error) => {
							alert(
								'Error creating round: ' + error.response?.data?.detail || error.message || error
							);
						});
				}}>Create</button
			>
		{:else}
			<button
				class="col btn btn-primary mt-2"
				onclick={() => {
					round
						.update({
							name,
							comment,
							result_rules,
              schedule_id: schedule?.schedule_id
						})
						.then((res) => Promise.all([getComps(), setComp(res)]))
						.then(oncreated)
						.catch((error) => {
							alert(
								'Error editing round: ' + error.response?.data?.detail || error.message || error
							);
						});
				}}>Save</button
			>
		{/if}
	</div>
</div>
