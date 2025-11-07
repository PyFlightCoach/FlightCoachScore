<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.min.js';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
	import Progress from './Progress.svelte';

	import MainNavBar from './MainNavBar.svelte';
	import { dev, windowHeight, windowWidth, serverDataLoaded } from '$lib/stores/shared';
	import '@beyonk/gdpr-cookie-consent-banner/banner.css';
	import GdprBanner from '@beyonk/gdpr-cookie-consent-banner';
	import Help from './Help.svelte';
	import BtmNavBar from './BtmNavBar.svelte';


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

	let pageHasHelp = $state(false);

  
</script>

<svelte:window bind:innerWidth={$windowWidth} bind:innerHeight={$windowHeight} />

<Progress />

<GdprBanner {...gpdc} />

<div class="container-fluid min-vh-100 d-flex flex-column overflow-auto">
	{#if !$serverDataLoaded || typeof $serverDataLoaded === 'string'}
		<div class="row flex-grow-1 justify-content-center align-items-center">
			<div class="col-lg-4 col-10">
				<div class="alert alert-info text-center" role="alert">
					{#if typeof $serverDataLoaded === 'string'}
						Error loading data from server<br />
						<span class="text-danger">{$serverDataLoaded}</span>
					{:else if $serverDataLoaded}
						Loaded GuiLists
					{:else}
						Loading data from the server...
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="row justify-self-start">
			<MainNavBar bind:hasHelp={pageHasHelp} />
		</div>
		<div class="row flex-grow-1 justify-content-center">
			<slot />
		</div>
    <div class="row justify-self-end">
      <BtmNavBar/>
    </div>
		
	{/if}
</div>

<Help bind:hasHelp={pageHasHelp} />

<svelte:head>
	<title>FCScore{$dev ? ' dev' : ''}</title>
</svelte:head>
