<script lang="ts">
	import { base } from '$app/paths';
	import { goto, afterNavigate } from '$app/navigation';
	import { user, loginUser } from '$lib/stores/user';
	import { loading } from '$lib/stores/shared';

	let previousPage: string = base || '/';

	let form_state: string | undefined;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
    if (previousPage.includes('user')) {
      previousPage = base;
    }
	});

	async function _handleSubmit(event: Event) {
    loading.set(true);
    const fdata = new FormData(event.currentTarget as HTMLFormElement);

    loginUser(fdata.get('email') as string, fdata.get('current-password') as string)
      .then(() => {
        form_state = undefined;
        goto(previousPage || base);
      })
      .catch((error) => {
        console.error('Login error:', error);
        form_state = 'Sign in has failed; please check your credentials.';
      })
      .finally(() => {
        loading.set(false);
      });

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
			<input type="email" class="form-control" id="email" name="email" autocomplete="username" required/>
		</div>

		<div class="mb-3">
			<label for="current-password" class="form-label">Password</label>
			<input type="password" class="form-control" id="current-password" name="current-password" autocomplete="current-password" required />
		</div>

		<div class="row mb-3">
			<div class="col">
				<button type="submit" class="btn btn-primary">Sign In</button>
			</div>

			<div class="col">
				<a href="{base}/user/password-request">Forgotten your password?</a>
			</div>
		</div>
	</form>
</div>
