<script lang="ts">
	import { dbServer } from '$lib/api';
	import TextInput from '$lib/components/TextInput.svelte';
	import { countries } from '$lib/utils/countries.js';
	import CheckInput from '$lib/components/CheckInput.svelte';

  interface UserSearchResult {
		id: string;
		name: string;
		country: string;
	}

	interface UserResult {
    id?: string | undefined;
		forname?: string | undefined;
		surname?: string | undefined;
		email?: string | undefined;
		country?: string | undefined;
	}

	let {
		allowFake,
    only_cds = false,
		onadded = () => {}
	}: {
		allowFake: boolean;
    only_cds?: boolean;
		onadded?: (user: UserResult) => void;
	} = $props();

	let name_or_email: string = $state('');
	let results: UserSearchResult[] | undefined = $state();
	let selected: UserSearchResult | undefined = $state();

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
	<small>Enter name (firstname lastname) or email address</small>
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
					.get('users/search', { params: { name_or_email, only_cds } })
					.then((res) => {
						results = (res.data.results as UserSearchResult[]);
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
			{#if !showCreateUser && allowFake}
				<div class="row mb-2">
					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							showCreateUser = true;
							selected = undefined;
						}}
					>
						Can't find your user? Create a new one here
					</button>
				</div>
			{/if}
		{:else}
			<small> Try to find the user in the database first, click Back to try again. </small>
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
		<div class="row mb-2">
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
					onadded(
							(selected ? {id: selected.id} : {
								forname: fakePilotForname!,
								surname: fakePilotSurname!,
								email: fakePilotEmail,
								country: fakePilotCountry!
							}) as UserResult
					);
				}}
				disabled={!selected && !fakeUserComplete}
				>{fakeUserComplete ? 'Create and Add' : 'Add'}</button
			>
		</div>
	</form>
{/if}
