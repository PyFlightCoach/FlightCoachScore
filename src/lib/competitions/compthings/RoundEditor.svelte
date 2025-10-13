<script lang="ts">
	import TextInput from '$lib/components/TextInput.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { setComp } from '$lib/stores/contests';
	import ResultRules from '../rules/ResultRules.svelte';
	import AddRules from '../rules/AddRules.svelte';
	import type { ResultRule, AddRule } from '$lib/api/DBInterfaces/competition';
	import { library } from '$lib/schedule/library';
	let {
		stage,
		round = undefined,
		oncreated = () => {}
	}: {
		stage: ContestManager;
		round?: ContestManager | undefined;
		oncreated?: () => void;
	} = $props();

	let name: string | undefined = $state(
		round?.summary.name || `Round ${(stage?.summary.children?.length || 0) + 1}`
	);
	let result_rules = $state(
		(round?.summary.result_rules || { normalise_best_to_n: 1000 }) as ResultRule
	);
	let add_rules = $state((round?.summary.add_rules || {}) as AddRule);

	let schedules = $derived(
		$library.subset({ category_id: stage.parent!.summary.category_id || undefined })
	);

	let isInherited = $derived(Number.isInteger(result_rules.score_from_stage_n));

	let schedule = $state(
		round?.summary.schedule_id
			? schedules.subset({ schedule_id: round?.summary.schedule_id! }).first || undefined
			: undefined
	);

	let disabled = $derived(round && !round?.isMyComp);

	let createUpdateRequest = $derived({
		name: isInherited
			? stage.competition.children[result_rules.score_from_stage_n!].summary.name
			: name,
		result_rules,
		schedule_id: isInherited ? undefined : schedule?.schedule_id
	});

</script>

<div class="col">
	<small class="row p-2">Round Settings</small>
	{#if !isInherited}
		<TextInput name="Name" bind:value={name} {disabled} />
		<div class="row mb-2">
			<label for="categorySelect" class="col col-form-label">Schedule:</label>
			<select
				class="col form-select col-form-input"
				id="categorySelect"
				bind:value={schedule}
				{disabled}
			>
				{#each schedules.schedules as schedule}
					<option value={schedule}>{schedule.schedule_name}</option>
				{/each}
			</select>
		</div>
	{:else}
		<TextInput
			name="Name"
			value={stage.competition.children[result_rules.score_from_stage_n!].summary.name}
			disabled={true}
		/>
	{/if}
	{#if false}
		<AddRules
			oldRule={add_rules}
			bind:newRule={add_rules}
			showChanges={round != undefined}
			whatAmI="Round"
		/>
	{/if}
	<ResultRules
		parent={stage}
		compThing={round}
		bind:newRule={result_rules}
		showChanges={round != undefined}
		{disabled}
	/>
	{#if !disabled}
		<div class="row">
			{#if !round}
				<button
					class="col btn btn-primary"
					disabled={!name}
					onclick={() => {
						stage!
							.addChild(createUpdateRequest)
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
					class="col btn btn-primary"
					onclick={() => {
						round
							.update(createUpdateRequest)
							.then((res) => Promise.all([setComp(res)]))
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
	{/if}
</div>
