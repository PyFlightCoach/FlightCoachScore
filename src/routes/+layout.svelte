<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.min.js';
	import 'bootstrap-icons/font/bootstrap-icons.css';

	import MainNavBar from '$lib/components/MainNavBar.svelte';
	import UserMenu from './UserMenu.svelte';
	import FlightMenu from './FlightMenu.svelte';
	import DataBaseMenu from './DataBaseMenu.svelte';
	import SettingsMenu from './SettingsMenu.svelte';

	import navBarContents from '$lib/stores/navBarContents';
</script>

<div class="container-fluid d-flex flex-column" style="height: 100vh;">
	<div class="row">
		<MainNavBar>
			<UserMenu />
			<FlightMenu />
			<DataBaseMenu />
			<SettingsMenu />

			{#if $navBarContents}
				<svelte:component this={$navBarContents} />
			{/if}
		</MainNavBar>
	</div>
	<div class="row flex-grow-1 " >
		<slot />
	</div>
</div>
