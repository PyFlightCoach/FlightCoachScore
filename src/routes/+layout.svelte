<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.min.js';
	import 'bootstrap-icons/font/bootstrap-icons.css';

	import MarkdownIt from 'markdown-it';
	import MainNavBar from './MainNavBar.svelte';
	import navBarContents from '$lib/stores/navBarContents';
	import { onMount } from 'svelte';
	import { dbServer } from '$lib/api';
	import { user } from '$lib/stores/user';
	import { page } from '$app/stores';
  import {base} from '$app/paths';
	import { loading, dev, help, showHelp } from '$lib/stores/shared';
	const md = new MarkdownIt();

	$: if ($page) {
    const helpFileName = $page.url.pathname.replace('/', '').replaceAll('/', '_');

    const helpPath = `${base}/help/${helpFileName || "home"}.md`;
    
    fetch(helpPath)
      .then(response => {if (!response.ok) {throw new Error('no help available')}; return response.text()})
      .then(text => $help = text)
      .catch((error) => {$help = undefined});

		
	}

	onMount(() => {
		dbServer
			.get('/users/me')
			.then((res) => {
				if (res) {
					user.set(res);
				}
			})
			.catch((e) => {
				console.debug('no user', e.message);
			});
	});
</script>

<div class="container-fluid justify-content-center min-vh-100 d-flex flex-column">
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

<div class="offcanvas offcanvas-end position-fixed" tabindex="-1" id="help" aria-labelledby="help">
	<div class="offcanvas-header">
		<h5>Help for {$page.url.pathname}</h5>
		<button
			type="button"
			class="btn-close text-reset"
			data-bs-dismiss="offcanvas"
			aria-label="Close"
		></button>
	</div>
	<div class="offcanvas-body">
		{#if $help}
			{@html md.render($help)}
		{/if}
	</div>
</div>

<svelte:head>
	<title>FCScore{$dev ? ' dev' : ''}</title>
</svelte:head>
