<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.min.js';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
	import Progress from './Progress.svelte';
	import MarkdownIt from 'markdown-it';
	import MainNavBar from './MainNavBar.svelte';
	import { onMount } from 'svelte';
	import { dbServer } from '$lib/api/api';
	import { user } from '$lib/stores/user';
	import { page } from '$app/state';
	import { dev, help, windowHeight, windowWidth } from '$lib/stores/shared';
	import '@beyonk/gdpr-cookie-consent-banner/banner.css';
	import GdprBanner from '@beyonk/gdpr-cookie-consent-banner';

	const { data } = $props();

	export const gpdc = {
		cookieName: 'fcscore_cookie_consent',
		heading: 'Cookie Consent',
		visible: 'true',
		buttonText: 'Accept Cookies',
		description:
			'The only cookies used by this website are for its correct operation. We do not use advertising, marketing or third-party tracking cookies.',
		choices: {
			necessary: {
				label: 'Necessary cookies',
				description: "Cookies to make this website work. Can't be turned off.",
				value: true
			},
			tracking: false,
			analytics: false,
			marketing: false
		},
		showEditIcon: false
	};

	polyfillCountryFlagEmojis();

	const md = new MarkdownIt({
		html: true,
		linkify: true,
		typographer: true
	});

	onMount(() => {
		dbServer
			.get('/users/me')
			.then((res) => {
				if (res) {
					user.set(res.data);
				}
			})
			.catch((e) => {
				console.error('no user:', e.message);
			});
	});
</script>

<svelte:window bind:innerWidth={$windowWidth} bind:innerHeight={$windowHeight} />

<Progress />

<GdprBanner {...gpdc} />

<div class="container-fluid  min-vh-100 d-flex flex-column overflow-auto  ">
  <div class="row justify-self-start">
    <MainNavBar/>
  </div>
	<div class="row flex-grow-1 justify-content-center ">
		<slot />
	</div>
</div>

<div class="offcanvas offcanvas-end position-fixed" tabindex="-1" id="help">
	<div class="offcanvas-header">
		<h5>Help for {page.url.pathname}</h5>
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
