<script lang="ts">
	import { dbServer } from '$lib/api/api.js';
	import { goto } from '$app/navigation';
  import { base } from '$app/paths';

	export let data;

	let form_state: string | undefined;

	async function _handleSubmit(event: Event) {
		try {
			const fdata = new FormData(event.currentTarget as HTMLFormElement);

			if (fdata.get('new-password') != fdata.get('password-confirm')) {
				form_state = 'Passwords do not match, please try again.';
				return;
			}

			const user = {
				token: data.token,
				password: fdata.get('new-password')
			};
      
      await dbServer.post('auth/reset-password', user);

	  form_state = undefined
	  
      await goto(base + '/user/login');
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

		<div class="row mb-3">
			<div class="col">
				<button type="submit" class="btn btn-primary">Reset My Password</button>
			</div>
		</div>
	</form>
</div>
