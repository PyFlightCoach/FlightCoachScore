<script lang="ts">
	import TextInput from '$lib/components/TextInput.svelte';
	import { faVersion } from '$lib/stores/shared';
	import { getCategories, type CategoryResponse } from '$lib/schedule/categories';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { reloadDropDownComps, setComp } from '$lib/stores/contests';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AddRules from '../rules/AddRules.svelte';
	import ResultRules from '../rules/ResultRules.svelte';
	import type { AddRule, ResultRule, CompThingMeta } from '$lib/api/DBInterfaces/competition';
	import EditCompThingMeta from './EditCompThingMeta.svelte';
	let {
		competition = undefined,
		oncreated = () => {}
	}: { competition?: ContestManager | undefined; oncreated?: () => void } = $props();

	let categories: CategoryResponse[] = $state([]);
	getCategories().then((cats) => {
		categories = cats;
		category = cats[0];
	});

	let name: string | undefined = $state(competition?.summary.name);
	let category: CategoryResponse | undefined = $state();
	getCategories().then((categories) => {
		categories.find((c) => c.category_id === competition?.summary.category_id);
	});

	let add_rules: AddRule = $state(competition?.summary.add_rules || ({} as AddRule));
	let result_rules = $state(competition?.summary.result_rules || ({} as ResultRule));
	let client_meta: CompThingMeta = $state(
		competition?.summary.client_meta || ({} as CompThingMeta)
	);
	let disabled = $derived(!competition?.isMyComp);
</script>

<div class="col">
	<small class="col p-2">Competition Settings</small>
	<TextInput name="Name" bind:value={name} {disabled}/>

	<div class="row mb-2">
		<label for="categorySelect" class="col col-form-label">Category:</label>
		<select
			class="col form-select col-form-input"
			id="categorySelect"
			bind:value={category}
			disabled={disabled || (competition && competition.schedules().length > 0)}
		>
			{#each categories as cat}
				<option value={cat}>{cat.category_name}</option>
			{/each}
		</select>
	</div>
	<AddRules bind:newRule={add_rules} showChanges={competition != undefined} whatAmI="Competition" {disabled}/>
	<ResultRules
		oldRule={result_rules}
		bind:newRule={result_rules}
		showChanges={competition != undefined}
		whatAmI="Competition"
    {disabled}
	/>
	<EditCompThingMeta
		oldMeta={competition?.summary.client_meta || {}}
		bind:newMeta={client_meta}
		showChanges={competition != undefined}
		whatAmI="Competition"
    {disabled}
	/>
  {#if !disabled}
	<div class="row">
		{#if !competition}
			<button
				class="col btn btn-primary "
				disabled={!name || !category}
				onclick={() => {
					ContestManager.newCompetition({
						name,
						client_meta,
						category_id: category!.category_id,
						fa_version: $faVersion,
						add_rules,
						result_rules
					})
						.then(setComp)
						.then(() => {
							oncreated();
							reloadDropDownComps();
							goto(resolve(`/competition/view`));
						})
						.catch((error) => {
							alert(
								'Error creating competition: ' + error.response?.data?.detail ||
									error.message ||
									error
							);
						});
				}}>Create</button
			>
		{:else}
			<button
				class="col btn btn-primary"
				onclick={() => {
					competition
						.update({
							name,
							client_meta,
							category_id: category?.category_id,
							add_rules,
							result_rules
						})
						.then(setComp)
						.then(oncreated)
						.catch((error) => {
							alert(
								'Error editing competition: ' + error.response?.data?.detail ||
									error.message ||
									error
							);
						});
				}}>Save</button
			>
		{/if}
	</div>
  {/if}
</div>
