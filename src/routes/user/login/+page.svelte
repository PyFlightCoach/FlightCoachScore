<script lang="ts">
	import { dbServer, formDataFromDict, jsonEscapeUTF } from '$lib/api';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';

	let form_state: string | undefined;

	async function _handleSubmit(event: Event) {
		try {
			const fdata = new FormData(event.currentTarget as HTMLFormElement);

			const fd = formDataFromDict({
				username: fdata.get('email'),
				password: fdata.get('password')
			});
			try {
				await dbServer.post('auth/jwt/login', fd);
			} catch {
				form_state = 'Sign in has failed; please check your credentials.';
				return;
			}
			$user = await dbServer.get('users/me');

			goto(`${base}/`);
		} catch (error) {
			form_state = 'Oops...something has gone wrong. Please try again later.';
		}
	}
</script>

<div class="container" style="max-width: 600px">
	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}

	<form class="row mt-4" method="POST" on:submit|preventDefault={_handleSubmit}>
		<div class="mb-3">
			<label for="email" class="form-label">Email address</label>
			<input type="email" class="form-control" id="email" name="email" required />
		</div>

		<div class="mb-3">
			<label for="password" class="form-label">Password</label>
			<input type="password" class="form-control" id="password" name="password" required />
		</div>

		<div class="row mb-3">
			<div class="col">
				<button type="submit" class="btn btn-primary">Sign In</button>
			</div>

			<div class="col">
				<a href="/password-request">Forgotten your password?</a>
			</div>
		</div>
	</form>
</div>
