<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.min.js';
	import 'bootstrap-icons/font/bootstrap-icons.css';

	import MainNavBar from './MainNavBar.svelte';
	import navBarContents from '$lib/stores/navBarContents';
	import { onMount } from 'svelte';
	import { dbServer } from '$lib/api';
	import { user } from '$lib/stores/user';
	import { loading } from '$lib/stores/shared';

	onMount(() => {
		dbServer
			.get('/users/me')
			.then((res) => {
				if (res) {
					user.set(res);
				}
			})
			.catch((e) => {
				console.log('no user', e.message);
			});
	});
</script>

<div class="container-fluid justify-content-md-center min-vh-100 d-flex flex-column">
	<div class="row">
		<MainNavBar>
			{#if $navBarContents}
				<svelte:component this={$navBarContents} />
			{/if}
		</MainNavBar>
	</div>
  {#if $loading}
		<div class="position-absolute top-50 start-50 spinner-border" role="status"></div>
	{/if}
	<div class="row flex-grow-1 justify-content-center">
		<slot />
	</div>
</div>
