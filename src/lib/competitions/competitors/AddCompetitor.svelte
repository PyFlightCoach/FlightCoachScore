<script lang="ts">
	import { dbServer } from '$lib/api';
	import type { ContestManager } from '../compthings/ContestManager';
	import { setComp } from '$lib/stores/contests';
	import TextInput from '$lib/components/TextInput.svelte';
	import { countries, split_country } from '$lib/utils/countries.js';
	import { SelectInput } from '$lib/manoeuvre/special_inputs/inputs';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import type { CreateFakeUserRequest } from '../compInterfaces';
	import { loading } from '$lib/stores/shared';

	interface CompetitorSearchResult {
		id: string;
		name: string;
		country: string;
	}

	let { competition, onadded = () => {} }: { competition: ContestManager; onadded?: () => void } =
		$props();

	let name_or_email: string = $state('');
	let results: CompetitorSearchResult[] | undefined = $state();
	let selected: CompetitorSearchResult | undefined = $state();

	let showCreateUser: boolean = $state(false);

	let fakePilotForname: string | undefined = $state(undefined);
	let fakePilotSurname: string | undefined = $state(undefined);
	let fakePilotCountry: string | undefined = $state(undefined);
	let fakePilotEmail: string | undefined = $state(undefined);
	let emailFakeUser: boolean = $state(true);

	let fakeUserComplete = $derived(fakePilotForname && fakePilotSurname && fakePilotCountry);

	let formState: string | undefined = $state();
</script>

{#if formState}
	<div class="row mt-4">
		<p><mark>{formState}</mark></p>
	</div>
{/if}

{#if !results}
	<small>Enter pilots name (firstname lastname) or email address</small>
	<form class="row p-2">
		<input
			class="col col-form-input form-control mx-2"
			type="text"
			bind:value={name_or_email}
			placeholder="Name or email"
			title="Name or email address of the pilot"
		/>
		<button
			class="col-auto btn btn-outline-primary px-4"
			type="submit"
			disabled={!name_or_email}
			onclick={() => {
				dbServer
					.get('users/search', { params: { name_or_email } })
					.then((res) => {
						results = res.data.results as CompetitorSearchResult[];
						selected = results?.length ? results[0] : undefined;
						formState = undefined;
					})
					.catch((e) => {
						formState = `Search failed: ${e.response?.data?.detail[0].msg || e.message || e}`;
					});
			}}>Search</button
		>
	</form>
{:else}
	<form>
		{#if !showCreateUser}
			<div class="row"><small>{results?.length || 'No'} results found</small></div>
			{#if results?.length}
				<select
					class="form-select"
					id="selectUser"
					size="3"
					autofocus
					bind:value={selected}
					onchange={() => {
						showCreateUser = false;
					}}
				>
					{#each results as result}
						<option value={result}>
							{result.name} ({result.country})
						</option>
					{/each}
				</select>
			{/if}
			{#if !showCreateUser}
				<div class="row p-2">
					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							showCreateUser = true;
							selected = undefined;
						}}
					>
						Can't find your pilot? Create a new one here
					</button>
				</div>
			{/if}
		{:else}
			<small>
				Only use this form if you can't find the pilot you are looking for in the database. If the
				pilot signs up to FCScore they will be able to link the flights in this competition with
				their account. Click <em class="fw-bold">Back</em> to try another search.
			</small>
			<TextInput name="First Name" bind:value={fakePilotForname} />
			<TextInput name="Last Name" bind:value={fakePilotSurname} />
			<TextInput name="Email" bind:value={fakePilotEmail} />
			<div class="row p-2">
				<label for="country" class="col-auto col-form-label">Country</label>
				<select
					class="col col-form-input form-select"
					id="country"
					name="country"
					bind:value={fakePilotCountry}
					style="font-family: 'Twemoji Country Flags', sans-serif !important"
				>
					{#each countries as c}
						<option value="{c.name} {c.emoji}">{c.name} {c.emoji}</option>
					{/each}
				</select>
			</div>
			{#if fakePilotEmail}
				<CheckInput
					name="Send them an email suggesting they sign up"
					bind:checked={emailFakeUser}
				/>
			{/if}
		{/if}
		<div class="row p-2">
			<button
				class="col btn btn-outline-primary"
				onclick={() => {
					results = undefined;
					selected = undefined;
					showCreateUser = false;
					formState = undefined;
				}}
			>
				Back
			</button>

			<button
				class="col btn btn-outline-primary"
				type="submit"
				onclick={() => {
          formState = 'Adding pilot...';
          $loading = true;
					competition
						.createPilot(
							selected?.id ||
								{
									first_name: fakePilotForname,
									last_name: fakePilotSurname,
									email: fakePilotEmail,
									...split_country(fakePilotCountry!)
								} as CreateFakeUserRequest
						)
						.then(res=>{
              return competition.addPilot(res);
            })
						.then((res) => {
							setComp(res);
							onadded();
						})
						.catch((e) => {
              console.log(e);
							formState = `Failed to add pilot: ${e.response?.data?.detail[0].msg || e}`;
						})
            .finally(() => { $loading = false;});
				}}
				disabled={!selected && !fakeUserComplete}
				>{fakeUserComplete ? 'Create and Add' : 'Add'}</button
			>
		</div>
	</form>
{/if}
