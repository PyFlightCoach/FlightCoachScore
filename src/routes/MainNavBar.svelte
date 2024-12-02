<script lang="ts">
	import { base } from '$app/paths';
	import UserMenu from './UserMenu.svelte';
	import FlightMenu from './FlightMenu.svelte';
	import DataBaseMenu from './DataBaseMenu.svelte';
	import SuperMenu from './SuperMenu.svelte';
	import { user } from '$lib/stores/user';
	import ScheduleMenu from './ScheduleMenu.svelte';
	import { dev } from '$app/environment';
	import AnalysisProgress from '$lib/components/progress/AnalysisProgress.svelte';

</script>

<nav class="navbar navbar-expand-md bg-body-tertiary" data-bs-theme="dark">
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
				<div class="row">
					<ul class="navbar-nav col-3 mr-auto">
						<UserMenu />
						<FlightMenu />
						<DataBaseMenu />
            <ScheduleMenu />
						{#if ($user && $user.is_superuser) || dev}
              <SuperMenu />
						{/if}
					</ul>
					<ul class="navbar-nav col-7 mr-auto">
						<slot />
					</ul>
					{#if 17 > 0}
						<div class="nav col-1 mr-auto">
							<AnalysisProgress />
						</div>
					{:else}
						<div class="col-1"></div>
					{/if}
					<span class="navbar-text col-1 mr-auto text-nowrap">
						{#if $user}
							{$user.first_name} {$user.last_name}
						{:else}
							Not Logged In
						{/if}
					</span>
				</div>
			</div>
		</div>
	</div>
</nav>
