<script lang="ts">
	import { base } from '$app/paths';
	import UserMenu from './UserMenu.svelte';
	import FlightMenu from './FlightMenu.svelte';
	import DataBaseMenu from './DataBaseMenu.svelte';
	import SuperMenu from './SuperMenu.svelte';
	import { user } from '$lib/stores/user';
	import { dev } from '$lib/stores/shared';
	import AnalysisProgress from '$lib/components/progress/AnalysisProgress.svelte';
</script>

<nav class="navbar navbar-expand-md bg-body-tertiary" data-bs-theme="dark">
	<div class="container-fluid justify-content-between">
    
		<ul class="navbar-nav flex-row">
      <a class="navbar-brand" href={base + '/'}>FCScore</a>
			<UserMenu />
			<FlightMenu />
			<DataBaseMenu />
			{#if $user?.is_superuser || $dev}
				<SuperMenu />
			{/if}
		</ul>

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
			<div class="container-fluid ">
        <div class="row justify-content-between">
					<ul class="col-8 navbar-nav justify-content-center">
						<slot />
					</ul>
					<ul class="col-4 justify-content-end navbar-nav">
						<AnalysisProgress />
						<span class="navbar-text mr-auto text-nowrap {$user?.is_verified ? '' : 'text-danger'}">
							{#if $user}
								{$user.first_name}
								{$user.last_name}
								{$dev ? 'd' : ''}{$user.is_superuser ? '*' : ''}
							{:else}
								Not Logged In
							{/if}
						</span>
					</ul>
			</div>
    </div>
		</div>
	</div>
</nav>
