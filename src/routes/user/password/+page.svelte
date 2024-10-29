<script lang="ts">
	import { dbServer } from '$lib/api.js';
	import { goto } from '$app/navigation';
  import { base } from '$app/paths';

	export let data;

	let form_state: string | undefined;

	async function _handleSubmit(event: Event) {
		try {
			const fdata = new FormData(event.currentTarget as HTMLFormElement);

			const user = {
				token: data.token,
				password: fdata.get('password')
			};
      
      await dbServer.post('auth/reset-password', user);

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
			<label for="password" class="form-label">Password</label>
			<input
				type="password"
				class="form-control"
				id="password"
				name="password"
				minlength="10"
				required
				aria-describedby="passwordhelp"
			/>
			<div id="passwordhelp" class="form-text">Minimum of ten characters</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<button type="submit" class="btn btn-primary">Reset My Password</button>
			</div>
		</div>
	</form>
</div>
