<script lang="ts">
	import TextInput from '$lib/components/TextInput.svelte';
	import { faVersion } from '$lib/stores/shared';
	import { getCategories, type CategoryResponse } from '$lib/schedule/categories';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { reloadDropDownComps, setComp } from '$lib/stores/contests';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AddRules from '../rules/AddRules.svelte';
	import ResultRules from '../rules/ResultRules.svelte';
	import type { AddRule, ResultRule } from '$lib/api/DBInterfaces/competition';

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
	let comment: string | undefined = $state(competition?.summary.comment || undefined);
	let category: CategoryResponse | undefined = $state();
	getCategories().then((categories) => {
		categories.find((c) => c.category_id === competition?.summary.category_id);
	});

	let add_rules: AddRule = $state((competition?.summary.add_rules || {}) as AddRule);
	let result_rules = $state((competition?.summary.result_rules || {}) as ResultRule);
</script>

<div class="col">
	<small>{#if !competition}Create{:else}Edit{/if} Competition</small>
	<TextInput name="Name" bind:value={name} />

	<div class="row">
		<label for="categorySelect" class="col col-form-label">Select Category:</label>
		<select class="col form-select col-form-input" id="categorySelect" bind:value={category} disabled={!!competition}>
			{#each categories as cat}
				<option value={cat}>{cat.category_name}</option>
			{/each}
		</select>
	</div>
	<AddRules bind:newRule={add_rules} showChanges={competition != undefined} whatAmI="Competition" />
	<ResultRules
		oldRule={{ raw_score: true }}
		bind:newRule={result_rules}
		showChanges={competition != undefined}
		whatAmI="Competition"
	/>
	<div class="row">
		{#if !competition}
			<button
				class="col btn btn-primary mt-2"
				disabled={!name || !category}
				onclick={() => {
					ContestManager.newCompetition({
						name,
						comment,
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
				class="col btn btn-primary mt-2"
				onclick={() => {
					competition
						.update({
							name,
							comment,
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
</div>
