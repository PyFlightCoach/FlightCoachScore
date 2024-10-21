<script lang="ts">
	import { base } from '$app/paths';
	import UserMenu from './UserMenu.svelte';
	import FlightMenu from './FlightMenu.svelte';
	import DataBaseMenu from './DataBaseMenu.svelte';
	import SettingsMenu from './SettingsMenu.svelte';
</script>

<nav class="navbar navbar-expand-sm bg-body-tertiary" data-bs-theme="dark">
	<div class="container-fluid">
		<a class="navbar-brand" href={base + '/'}>FCScore</a>

		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<div class="container-fluid">
        <div class='row'> 
				<ul class="navbar-nav col-3 mr-auto">
					<UserMenu />
					<FlightMenu />
					<DataBaseMenu />
					<SettingsMenu />
				</ul>
				<ul class="navbar-nav col-6 mr-auto">
					<slot />
				</ul>
        <div class='row'> 
			</div>
		</div>
	</div>
</nav>
