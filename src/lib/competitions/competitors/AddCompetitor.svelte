<script lang="ts">
	import { dbServer } from '$lib/api';
	import type { ContestManager } from '../compthings/ContestManager';
  import {setComp} from '$lib/stores/contests';
	let { competition, onadded = () => {} }: { competition: ContestManager; onadded?: () => void } =
		$props();

	let name_or_email: string = $state('');
	let results: { id: string; name: string; country: string }[] | undefined = $state();
	let selected: string | undefined = $state();

	let formState: string | undefined = $state();
</script>

{#if formState}
	<div class="row mt-4">
		<p><mark>{formState}</mark></p>
	</div>
{/if}

{#if !results}
	<small>Enter pilots name (firstname lastname) or email address</small>
	<div class="row p-2">
		<input
			class="col col-form-input form-control mx-2"
			type="text"
			bind:value={name_or_email}
			placeholder="Name or email"
			title="Name or email address of the pilot"
		/>
		<button
			class="col-auto btn btn-outline-primary px-4"
			onclick={() => {
				dbServer
					.get('users/search', { params: { name_or_email } })
					.then((res) => {
						results = res.data.results;
					})
					.catch((e) => {
						formState = `Search failed: ${e.response?.data?.detail || e}`;
					});
			}}>Search</button
		>
	</div>
{:else}
	<small>{results?.length} results found</small>
	<select class="form-select" size="3" bind:value={selected}>
		{#each results as result}
			<option value={result.id}>
				{result.name} ({result.country})
			</option>
		{/each}
	</select>
	<div class="row p-2">
		<button
			class="col btn btn-outline-primary"
			onclick={() => {
				results = undefined;
				selected = undefined;
			}}
		>
			Back
		</button>
		<button
			class="col btn btn-outline-primary"
			onclick={() => {
				competition.addPilot(selected!).then((res) => {
					setComp(res);
					onadded();
				})
        .catch((e) => {
          formState = `Failed to add pilot: ${e.response?.data?.detail || e}`;
        });
			}}
			disabled={!selected}>Add</button
		>
	</div>
{/if}
