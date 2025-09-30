<script lang="ts">
	import { dbServer } from '$lib/api/api';
	import { countries, split_country } from '$lib/utils/countries.js';
	import { invalidateAll } from '$app/navigation';
	import { user } from '$lib/stores/user';
  import {base} from '$app/paths';
	import DisplayDict from '$lib/components/DisplayDict.svelte';

	let form_state: string | undefined = undefined;

	async function _handleSubmit(event: Event) {
		try {
			const fdata = new FormData(event.currentTarget as HTMLFormElement);

			const s_country = split_country(fdata.get('country'));

			const userUpdate = {
				first_name: fdata.get('first_name'),
				last_name: fdata.get('last_name'),
				email: fdata.get('email'),
				country: s_country[0],
				country_emoji: s_country[1]
			};

			form_state = undefined;
			const res = await dbServer.patch('users/me', userUpdate);

			$user = (await dbServer.get('users/me')).data;
			form_state = 'Your profile has been updated.';
			await invalidateAll();
		} catch (error) {
			form_state = 'Oops...something has gone wrong. Please try again later.';
		}
	}

	async function _handleSubmitPassword(event: Event) {
		try {
			const fdata = new FormData(event.currentTarget as HTMLFormElement);

			if (fdata.get('new-password') != fdata.get('password-confirm')) {
				form_state = 'Passwords do not match, please try again.';
				return;
			}

			const userUpdate = { password: fdata.get('new-password') };
			form_state = undefined;

			const res = await dbServer.patch('users/me', userUpdate);

			form_state = 'Your password has been updated.';
		} catch (error) {
			form_state = 'Oops...something has gone wrong. Please try again later.';
		}
	}
</script>

<div class="container" style="max-width:800px">

  {#if $user && !$user.is_verified}
    <div class="row mt-4 text-danger">
      <p><mark>Awaiting email verification, click <a class="link" href="{base}/user/verify-request/?email={$user.email}">here</a> for a new verification email</mark></p>
    </div>
  {/if}

	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}

	<form class="row mt-4 border rounded" method="POST" on:submit|preventDefault={_handleSubmit}>
		<div class="col">
			<div class="mt-3 mb-3">
				<label for="first_name" class="form-label">First Name</label>
				<input
					type="text"
					class="form-control"
					id="first_name"
					name="first_name"
					value={$user?.first_name}
					required
				/>
			</div>
		</div>
		<div class="col">
			<div class="mt-3 mb-3">
				<label for="last_name" class="form-label">Last Name</label>
				<input
					type="text"
					class="form-control"
					id="last_name"
					name="last_name"
					value={$user?.last_name}
					required
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="email" class="form-label text-muted">Email address</label>
			<input
				type="email"
				class="form-control text-muted bg-light"
				id="email"
				name="email"
				value={$user?.email}
				readonly
			/>
		</div>

		<div class="mb-3" style="font-family: 'Twemoji Country Flags', sans-serif !important">
			<label for="country" class="form-label">Country</label>
			<select
				class="form-select"
				id="country"
				name="country"
				value="{$user?.country} {$user?.country_emoji}"
				required
			>
				{#each countries as c}
					<option value="{c.name} {c.emoji}">{c.name} {c.emoji}</option>
				{/each}
			</select>
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary">Update</button>
		</div>
	</form>

	<form
		class="row mt-4 border rounded"
		method="POST"
		on:submit|preventDefault={_handleSubmitPassword}
	>
		<div class="mt-3 mb-3">
			<label for="new-password" class="form-label">Password</label>
			<input
				type="password"
				class="form-control"
				id="new-password"
				name="new-password"
				autocomplete="new-password"
				minlength="10"
				required
				aria-describedby="passwordhelp"
			/>
			<div id="passwordhelp" class="form-text">Minimum of ten characters</div>
		</div>

		<div class="mb-3">
			<input
				type="password"
				class="form-control"
				id="password-confirm"
				name="password-confirm"
				placeholder="Confirm your new password"
				minlength="10"
				required
			/>
		</div>

		<div class="mb-3">
			<button type="submit" class="btn btn-primary">Update Password</button>
		</div>
	</form>

  <div class="row border rounded mt-4">
      <div class="row mt-3 mb-3">
    {#await dbServer.get('/users/me/viewsstats')}
      <div></div>
    {:then res}

        <span>Hours: {res.data.results[0].hours}</span>
        <span>Views: {res.data.results[0].views}</span>
        <span>Remaining Views: {res.data.results[0].remaining_views}</span>
        

    {/await}
    <span>To delete your account, please email <a href="mailto:admin@flightcoachscore.org">admin@fcscore.org</a></span>
    </div>
  </div>
</div>
